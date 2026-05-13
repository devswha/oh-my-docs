#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const APPS = {
  codex: 'apps/codex',
  claudecode: 'apps/claudecode',
  openagent: 'apps/openagent',
};

function usage() {
  console.log(`Usage: node generate-with-gti.mjs --app <app> --prompt <text>|--prompt-file <file> --output <path> [options]

Options:
  --app <codex|claudecode|openagent>  App whose public/images directory should contain the output.
  --prompt <text>                     Image prompt.
  --prompt-file <file>                 Read prompt from file.
  --output <path>                      Output PNG path, normally apps/<app>/public/images/docs/name.png.
  --size <size>                        gti size, e.g. 1536x1024, 2048x1152, auto.
  --provider <mode>                    gti provider: auto, private-codex, codex-cli. Default: auto.
  --image <path>                       Input image. Repeatable.
  --dry-run                            Validate and call gti with --dry-run. Default unless --live is set.
  --live                               Generate the image.
  --use-npx                            If gti is not installed, explicitly run npx -y god-tibo-imagen.
  --allow-outside-public               Allow output outside the app public/images directory.
  --help                               Show this help.
`);
}

function parseArgs(argv) {
  const out = { app: 'codex', provider: 'auto', images: [], dryRun: true, useNpx: false, allowOutsidePublic: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--app') out.app = argv[++i];
    else if (arg === '--prompt') out.prompt = argv[++i];
    else if (arg === '--prompt-file') out.promptFile = argv[++i];
    else if (arg === '--output') out.output = argv[++i];
    else if (arg === '--size') out.size = argv[++i];
    else if (arg === '--provider') out.provider = argv[++i];
    else if (arg === '--image') out.images.push(argv[++i]);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--live') out.dryRun = false;
    else if (arg === '--use-npx') out.useNpx = true;
    else if (arg === '--allow-outside-public') out.allowOutsidePublic = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!APPS[out.app]) throw new Error(`Unknown app '${out.app}'. Expected one of: ${Object.keys(APPS).join(', ')}`);
  return out;
}

function commandExists(name) {
  // `command -v` is a POSIX shell builtin, so it can't be invoked directly
  // via spawnSync('command', ...). Pass through sh with the name as $1 so
  // it is never interpolated into the script string — safe regardless of
  // what the caller provides.
  if (!/^[A-Za-z0-9_.-]+$/.test(name)) return false;
  const result = spawnSync(
    'sh',
    ['-c', 'command -v "$1" >/dev/null 2>&1', '_', name],
    { encoding: 'utf8' },
  );
  return result.status === 0;
}

function resolveGtiCommand(args) {
  if (commandExists('gti')) return { command: 'gti', prefix: [] };
  if (args.useNpx && commandExists('npx')) {
    return { command: 'npx', prefix: ['-y', 'god-tibo-imagen'] };
  }
  return null;
}

function ensureSafeOutput(args) {
  if (!args.output) throw new Error('--output is required');
  const output = path.resolve(args.output);
  if (!args.allowOutsidePublic) {
    const allowed = path.resolve(APPS[args.app], 'public/images');
    if (!(output === allowed || output.startsWith(`${allowed}${path.sep}`))) {
      throw new Error(`Refusing output outside ${allowed}. Pass --allow-outside-public only for intentional scratch output.`);
    }
  }
  mkdirSync(path.dirname(output), { recursive: true });
  return output;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  const prompt = args.promptFile ? readFileSync(args.promptFile, 'utf8').trim() : args.prompt;
  if (!prompt) throw new Error('Provide --prompt or --prompt-file');
  const output = ensureSafeOutput(args);
  for (const image of args.images) {
    if (!existsSync(image)) throw new Error(`Input image not found: ${image}`);
  }
  const gti = resolveGtiCommand(args);
  if (!gti) {
    console.error('[generate-with-gti] gti command not found. Install/authenticate gti, or pass --use-npx to explicitly run npx -y god-tibo-imagen.');
    process.exit(2);
  }
  const gtiArgs = ['--provider', args.provider, '--prompt', prompt, '--output', output];
  if (args.size) gtiArgs.push('--size', args.size);
  for (const image of args.images) gtiArgs.push('--image', image);
  if (args.dryRun) gtiArgs.push('--dry-run');
  const commandArgs = [...gti.prefix, ...gtiArgs];

  console.error(`[generate-with-gti] Running: ${gti.command} ${commandArgs.map((part) => part.includes(' ') ? JSON.stringify(part) : part).join(' ')}`);
  const result = spawnSync(gti.command, commandArgs, { stdio: 'inherit' });
  process.exit(result.status ?? 1);
} catch (error) {
  console.error(`[generate-with-gti] ${error.message}`);
  process.exit(1);
}
