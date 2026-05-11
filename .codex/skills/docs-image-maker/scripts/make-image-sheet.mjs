#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const APPS = {
  codex: 'apps/codex',
  claudecode: 'apps/claudecode',
  openagent: 'apps/openagent',
};

function usage() {
  console.log(`Usage: node make-image-sheet.mjs [options]

Create a self-contained HTML-first review sheet and optionally export the selected SVG asset.

Options:
  --app <codex|claudecode|openagent>  App for asset path safety. Default: codex.
  --topic <ultragoal>                 Built-in image brief. Default: ultragoal.
  --sheet <path>                      Review sheet output. Default: .omx/artifacts/docs-images/<topic>.html.
  --asset <path>                      SVG asset output. Default: apps/<app>/public/images/docs/skills-workflow-<topic>-flow.svg.
  --pick <rail|orbit|handoff>         Candidate to export. Default: rail.
  --sheet-only                        Do not write the selected SVG asset.
  --allow-outside-public              Allow --asset outside apps/<app>/public/images.
  --help                              Show this help.
`);
}

function parseArgs(argv) {
  const out = { app: 'codex', topic: 'ultragoal', pick: 'rail', sheetOnly: false, allowOutsidePublic: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--app') out.app = argv[++i];
    else if (arg === '--topic') out.topic = argv[++i];
    else if (arg === '--sheet') out.sheet = argv[++i];
    else if (arg === '--asset') out.asset = argv[++i];
    else if (arg === '--pick') out.pick = argv[++i];
    else if (arg === '--sheet-only') out.sheetOnly = true;
    else if (arg === '--allow-outside-public') out.allowOutsidePublic = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!APPS[out.app]) throw new Error(`Unknown app '${out.app}'. Expected one of: ${Object.keys(APPS).join(', ')}`);
  if (out.topic !== 'ultragoal') throw new Error("Only built-in topic 'ultragoal' is currently supported");
  if (!['rail', 'orbit', 'handoff'].includes(out.pick)) throw new Error("--pick must be one of: rail, orbit, handoff");
  out.sheet ??= `.omx/artifacts/docs-images/${out.topic}.html`;
  out.asset ??= `${APPS[out.app]}/public/images/docs/skills-workflow-${out.topic}-flow.svg`;
  return out;
}

function ensureAssetPath(args) {
  const output = path.resolve(args.asset);
  if (!args.allowOutsidePublic) {
    const allowed = path.resolve(APPS[args.app], 'public/images');
    if (!(output === allowed || output.startsWith(`${allowed}${path.sep}`))) {
      throw new Error(`Refusing asset outside ${allowed}. Pass --allow-outside-public for scratch assets.`);
    }
  }
  mkdirSync(path.dirname(output), { recursive: true });
  return output;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function workflowRailSvg(prefix = 'ug-rail') {
  return `<svg width="1536" height="864" viewBox="0 0 1536 864" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${prefix}-title ${prefix}-desc">
  <title id="${prefix}-title">Ultragoal durable goal workflow</title>
  <desc id="${prefix}-desc">A large plan becomes one aggregate goal, durable milestone cards, an append-only ledger, an explicit goal handoff, and a final verification gate.</desc>
  <defs>
    <linearGradient id="${prefix}-bg" x1="100" y1="80" x2="1420" y2="800" gradientUnits="userSpaceOnUse">
      <stop stop-color="#07111F"/>
      <stop offset="0.56" stop-color="#0C1C33"/>
      <stop offset="1" stop-color="#102E56"/>
    </linearGradient>
    <linearGradient id="${prefix}-card" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#163963"/>
      <stop offset="1" stop-color="#0B223D"/>
    </linearGradient>
    <linearGradient id="${prefix}-cyan" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#67E8F9"/>
      <stop offset="1" stop-color="#3B82F6"/>
    </linearGradient>
    <linearGradient id="${prefix}-violet" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#C084FC"/>
      <stop offset="1" stop-color="#6366F1"/>
    </linearGradient>
    <linearGradient id="${prefix}-green" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#86EFAC"/>
      <stop offset="1" stop-color="#14B8A6"/>
    </linearGradient>
    <filter id="${prefix}-shadow" x="-18%" y="-22%" width="136%" height="150%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="18" stdDeviation="21" flood-color="#020617" flood-opacity="0.38"/>
    </filter>
    <filter id="${prefix}-glow" x="-70%" y="-70%" width="240%" height="240%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.24 0 0 0 0 0.76 0 0 0 0 0.98 0 0 0 0.44 0"/>
      <feBlend in="SourceGraphic" mode="screen"/>
    </filter>
    <marker id="${prefix}-arrow" markerWidth="18" markerHeight="18" refX="13" refY="9" orient="auto" markerUnits="strokeWidth">
      <path d="M3 3L14 9L3 15" stroke="#8BDCF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <pattern id="${prefix}-grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" stroke="#93C5FD" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1536" height="864" rx="46" fill="url(#${prefix}-bg)"/>
  <rect x="48" y="44" width="1440" height="776" rx="40" fill="url(#${prefix}-grid)" opacity="0.8"/>
  <circle cx="236" cy="146" r="170" fill="#2563EB" opacity="0.13"/>
  <circle cx="1292" cy="714" r="226" fill="#06B6D4" opacity="0.11"/>
  <path d="M114 670C272 530 410 594 568 464C742 320 896 294 1064 356C1198 406 1300 344 1428 224" stroke="#7DD3FC" stroke-opacity="0.11" stroke-width="52" stroke-linecap="round"/>

  <path d="M274 452C430 334 566 312 716 332C854 350 974 430 1122 398" stroke="#8BDCF6" stroke-opacity="0.34" stroke-width="7" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
  <path d="M418 556C568 668 734 678 916 596C1012 552 1090 566 1160 626" stroke="#99F6E4" stroke-opacity="0.30" stroke-width="6" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>

  <g filter="url(#${prefix}-shadow)">
    <rect x="112" y="294" width="258" height="316" rx="34" fill="url(#${prefix}-card)" stroke="#60A5FA" stroke-opacity="0.42" stroke-width="2"/>
    <rect x="146" y="336" width="190" height="24" rx="12" fill="#BAE6FD" opacity="0.84"/>
    <rect x="146" y="390" width="150" height="17" rx="8.5" fill="#93C5FD" opacity="0.48"/>
    <rect x="146" y="432" width="174" height="17" rx="8.5" fill="#93C5FD" opacity="0.40"/>
    <rect x="146" y="474" width="126" height="17" rx="8.5" fill="#93C5FD" opacity="0.36"/>
    <circle cx="198" cy="548" r="28" fill="url(#${prefix}-cyan)" opacity="0.22"/>
    <path d="M178 548L202 572L260 510" stroke="#67E8F9" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g filter="url(#${prefix}-shadow)">
    <circle cx="728" cy="224" r="108" fill="#0B203A" stroke="#60A5FA" stroke-opacity="0.54" stroke-width="2"/>
    <circle cx="728" cy="224" r="70" fill="url(#${prefix}-cyan)" opacity="0.20" filter="url(#${prefix}-glow)"/>
    <path d="M672 224C672 193.1 697.1 168 728 168C758.9 168 784 193.1 784 224C784 254.9 758.9 280 728 280C697.1 280 672 254.9 672 224Z" stroke="#BAE6FD" stroke-width="9" opacity="0.92"/>
    <path d="M726 142V166M726 282V306M808 224H784M672 224H648" stroke="#67E8F9" stroke-width="9" stroke-linecap="round" opacity="0.68"/>
    <circle cx="812" cy="158" r="16" fill="url(#${prefix}-violet)" opacity="0.92"/>
    <circle cx="640" cy="286" r="12" fill="url(#${prefix}-green)" opacity="0.9"/>
  </g>

  <g filter="url(#${prefix}-shadow)">
    <rect x="458" y="412" width="182" height="126" rx="28" fill="#0F2A4D" stroke="#38BDF8" stroke-opacity="0.45" stroke-width="2"/>
    <circle cx="500" cy="458" r="20" fill="url(#${prefix}-cyan)"/>
    <rect x="536" y="442" width="70" height="16" rx="8" fill="#DBEAFE" opacity="0.78"/>
    <rect x="536" y="476" width="88" height="13" rx="6.5" fill="#93C5FD" opacity="0.42"/>
  </g>
  <g filter="url(#${prefix}-shadow)">
    <rect x="678" y="456" width="182" height="126" rx="28" fill="#0F2A4D" stroke="#A78BFA" stroke-opacity="0.50" stroke-width="2"/>
    <circle cx="720" cy="502" r="20" fill="url(#${prefix}-violet)"/>
    <rect x="756" y="486" width="82" height="16" rx="8" fill="#EDE9FE" opacity="0.78"/>
    <rect x="756" y="520" width="60" height="13" rx="6.5" fill="#C4B5FD" opacity="0.44"/>
  </g>
  <g filter="url(#${prefix}-shadow)">
    <rect x="898" y="412" width="182" height="126" rx="28" fill="#0F2A4D" stroke="#5EEAD4" stroke-opacity="0.50" stroke-width="2"/>
    <circle cx="940" cy="458" r="20" fill="url(#${prefix}-green)"/>
    <rect x="976" y="442" width="74" height="16" rx="8" fill="#CCFBF1" opacity="0.80"/>
    <rect x="976" y="476" width="92" height="13" rx="6.5" fill="#5EEAD4" opacity="0.42"/>
  </g>

  <g filter="url(#${prefix}-shadow)">
    <rect x="1160" y="244" width="238" height="324" rx="34" fill="#0E2A3D" stroke="#22D3EE" stroke-opacity="0.44" stroke-width="2"/>
    <rect x="1200" y="286" width="154" height="22" rx="11" fill="#A5F3FC" opacity="0.82"/>
    <rect x="1198" y="350" width="160" height="44" rx="16" fill="#164E63" stroke="#67E8F9" stroke-opacity="0.34"/>
    <circle cx="1228" cy="372" r="10" fill="#67E8F9"/>
    <rect x="1254" y="364" width="70" height="13" rx="6.5" fill="#CFFAFE" opacity="0.58"/>
    <rect x="1198" y="416" width="160" height="44" rx="16" fill="#164E63" stroke="#A78BFA" stroke-opacity="0.32"/>
    <circle cx="1228" cy="438" r="10" fill="#A78BFA"/>
    <rect x="1254" y="430" width="82" height="13" rx="6.5" fill="#E0E7FF" opacity="0.54"/>
    <rect x="1198" y="482" width="160" height="44" rx="16" fill="#164E63" stroke="#86EFAC" stroke-opacity="0.30"/>
    <circle cx="1228" cy="504" r="10" fill="#86EFAC"/>
    <rect x="1254" y="496" width="58" height="13" rx="6.5" fill="#CCFBF1" opacity="0.54"/>
  </g>

  <g filter="url(#${prefix}-shadow)">
    <path d="M1242 618L1340 662V728C1340 772 1303 796 1242 818C1181 796 1144 772 1144 728V662L1242 618Z" fill="#102C3E" stroke="#86EFAC" stroke-opacity="0.58" stroke-width="2"/>
    <path d="M1198 720L1228 750L1292 684" stroke="#86EFAC" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g opacity="0.78">
    <path d="M376 456H444" stroke="#8BDCF6" stroke-width="5" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
    <path d="M644 482H672" stroke="#A5F3FC" stroke-width="5" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
    <path d="M864 482H892" stroke="#99F6E4" stroke-width="5" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
    <path d="M1088 470C1118 456 1128 414 1150 398" stroke="#8BDCF6" stroke-width="5" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
    <path d="M1276 574V612" stroke="#99F6E4" stroke-width="5" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
  </g>

  <circle cx="418" cy="300" r="7" fill="#67E8F9" opacity="0.75"/>
  <circle cx="422" cy="646" r="6" fill="#A78BFA" opacity="0.74"/>
  <circle cx="836" cy="652" r="8" fill="#86EFAC" opacity="0.75"/>
  <circle cx="1106" cy="230" r="7" fill="#67E8F9" opacity="0.70"/>
  <circle cx="1402" cy="598" r="8" fill="#C084FC" opacity="0.64"/>
</svg>`;
}

function orbitSvg(prefix = 'ug-orbit') {
  return `<svg width="1536" height="864" viewBox="0 0 1536 864" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${prefix}-title ${prefix}-desc">
  <title id="${prefix}-title">Ultragoal aggregate orbit concept</title>
  <desc id="${prefix}-desc">A single aggregate goal anchors multiple orbiting story checkpoints and a durable evidence trail.</desc>
  <defs>
    <linearGradient id="${prefix}-bg" x1="0" y1="0" x2="1536" y2="864" gradientUnits="userSpaceOnUse"><stop stop-color="#06101E"/><stop offset="1" stop-color="#112D4F"/></linearGradient>
    <linearGradient id="${prefix}-cyan" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#67E8F9"/><stop offset="1" stop-color="#3B82F6"/></linearGradient>
    <linearGradient id="${prefix}-violet" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#C084FC"/><stop offset="1" stop-color="#6366F1"/></linearGradient>
    <filter id="${prefix}-shadow"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#020617" flood-opacity="0.42"/></filter>
    <pattern id="${prefix}-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" stroke="#93C5FD" stroke-opacity="0.055"/></pattern>
  </defs>
  <rect width="1536" height="864" rx="46" fill="url(#${prefix}-bg)"/>
  <rect x="52" y="48" width="1432" height="768" rx="40" fill="url(#${prefix}-grid)"/>
  <circle cx="768" cy="430" r="272" stroke="#67E8F9" stroke-opacity="0.16" stroke-width="32"/>
  <circle cx="768" cy="430" r="190" stroke="#C4B5FD" stroke-opacity="0.20" stroke-width="18"/>
  <g filter="url(#${prefix}-shadow)">
    <circle cx="768" cy="430" r="118" fill="#0B203A" stroke="#60A5FA" stroke-opacity="0.6" stroke-width="2"/>
    <circle cx="768" cy="430" r="76" fill="url(#${prefix}-cyan)" opacity="0.2"/>
    <path d="M718 430C718 402 740 380 768 380C796 380 818 402 818 430C818 458 796 480 768 480C740 480 718 458 718 430Z" stroke="#BAE6FD" stroke-width="10"/>
  </g>
  ${[[494,300,'cyan'],[988,286,'violet'],[1052,574,'cyan'],[542,608,'violet']].map(([x,y,kind], i) => `<g filter="url(#${prefix}-shadow)"><rect x="${x - 92}" y="${y - 54}" width="184" height="108" rx="28" fill="#0F2A4D" stroke="${kind === 'cyan' ? '#38BDF8' : '#A78BFA'}" stroke-opacity="0.5"/><circle cx="${x - 48}" cy="${y - 12}" r="18" fill="url(#${prefix}-${kind})"/><rect x="${x - 14}" y="${y - 26}" width="78" height="15" rx="7.5" fill="#E0F2FE" opacity="0.7"/><rect x="${x - 14}" y="${y + 8}" width="${i % 2 ? 54 : 90}" height="12" rx="6" fill="#93C5FD" opacity="0.4"/></g>`).join('')}
  <path d="M412 300C532 164 996 164 1128 308" stroke="#8BDCF6" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
  <path d="M1126 560C986 720 550 716 410 548" stroke="#C4B5FD" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
  <rect x="1184" y="360" width="218" height="264" rx="34" fill="#0E2A3D" stroke="#22D3EE" stroke-opacity="0.44" filter="url(#${prefix}-shadow)"/>
  <circle cx="1234" cy="426" r="11" fill="#67E8F9"/><circle cx="1234" cy="492" r="11" fill="#A78BFA"/><circle cx="1234" cy="558" r="11" fill="#86EFAC"/>
  <rect x="1262" y="416" width="86" height="14" rx="7" fill="#CFFAFE" opacity="0.58"/><rect x="1262" y="482" width="104" height="14" rx="7" fill="#E0E7FF" opacity="0.5"/><rect x="1262" y="548" width="68" height="14" rx="7" fill="#CCFBF1" opacity="0.54"/>
</svg>`;
}

function handoffSvg(prefix = 'ug-handoff') {
  return `<svg width="1536" height="864" viewBox="0 0 1536 864" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${prefix}-title ${prefix}-desc">
  <title id="${prefix}-title">Ultragoal explicit handoff concept</title>
  <desc id="${prefix}-desc">A repo-side durable plan and ledger remain separated from hidden thread state; an explicit handoff reaches the active Codex goal.</desc>
  <defs>
    <linearGradient id="${prefix}-bg" x1="0" y1="0" x2="1536" y2="864" gradientUnits="userSpaceOnUse"><stop stop-color="#07111F"/><stop offset="1" stop-color="#10284B"/></linearGradient>
    <linearGradient id="${prefix}-cyan" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#67E8F9"/><stop offset="1" stop-color="#3B82F6"/></linearGradient>
    <linearGradient id="${prefix}-green" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#86EFAC"/><stop offset="1" stop-color="#14B8A6"/></linearGradient>
    <filter id="${prefix}-shadow"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#020617" flood-opacity="0.38"/></filter>
    <marker id="${prefix}-arrow" markerWidth="18" markerHeight="18" refX="13" refY="9" orient="auto"><path d="M3 3L14 9L3 15" stroke="#8BDCF6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></marker>
  </defs>
  <rect width="1536" height="864" rx="46" fill="url(#${prefix}-bg)"/>
  <circle cx="390" cy="430" r="250" fill="#2563EB" opacity="0.10"/>
  <circle cx="1140" cy="430" r="250" fill="#06B6D4" opacity="0.10"/>
  <path d="M764 150V714" stroke="#93C5FD" stroke-opacity="0.24" stroke-width="8" stroke-dasharray="18 22" stroke-linecap="round"/>
  <g filter="url(#${prefix}-shadow)">
    <rect x="140" y="252" width="420" height="356" rx="42" fill="#0F2A4D" stroke="#60A5FA" stroke-opacity="0.42"/>
    <rect x="194" y="306" width="188" height="22" rx="11" fill="#BAE6FD" opacity="0.82"/>
    <rect x="194" y="372" width="280" height="48" rx="18" fill="#164E63" stroke="#67E8F9" stroke-opacity="0.32"/>
    <rect x="194" y="448" width="280" height="48" rx="18" fill="#164E63" stroke="#A78BFA" stroke-opacity="0.32"/>
    <rect x="194" y="524" width="280" height="48" rx="18" fill="#164E63" stroke="#86EFAC" stroke-opacity="0.32"/>
    <circle cx="230" cy="396" r="10" fill="#67E8F9"/><circle cx="230" cy="472" r="10" fill="#A78BFA"/><circle cx="230" cy="548" r="10" fill="#86EFAC"/>
  </g>
  <path d="M578 430C652 430 670 384 728 384" stroke="#8BDCF6" stroke-width="7" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
  <path d="M808 384C904 384 916 430 986 430" stroke="#8BDCF6" stroke-width="7" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
  <g filter="url(#${prefix}-shadow)">
    <circle cx="1140" cy="430" r="150" fill="#0B203A" stroke="#60A5FA" stroke-opacity="0.52"/>
    <circle cx="1140" cy="430" r="94" fill="url(#${prefix}-cyan)" opacity="0.19"/>
    <path d="M1084 432C1084 401 1109 376 1140 376C1171 376 1196 401 1196 432C1196 463 1171 488 1140 488C1109 488 1084 463 1084 432Z" stroke="#BAE6FD" stroke-width="11"/>
  </g>
  <g filter="url(#${prefix}-shadow)">
    <path d="M1140 608L1230 648V710C1230 750 1196 772 1140 792C1084 772 1050 750 1050 710V648L1140 608Z" fill="#102C3E" stroke="#86EFAC" stroke-opacity="0.58"/>
    <path d="M1102 704L1130 732L1188 672" stroke="url(#${prefix}-green)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

function minimalDocsFlowSvg(prefix = 'ug-minimal') {
  return `<svg width="1200" height="420" viewBox="0 0 1200 420" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${prefix}-title ${prefix}-desc">
  <title id="${prefix}-title">Ultragoal minimal workflow diagram</title>
  <desc id="${prefix}-desc">A minimal line diagram showing an approved plan flowing through durable stories, a ledger, an explicit goal handoff, and a final verification gate.</desc>
  <style>
    .outer { stroke: #d4d4d8; }
    .card { fill: none; stroke: #d4d4d8; }
    .muted { fill: #71717a; opacity: .10; }
    .line { stroke: #a1a1aa; }
    .accent { stroke: #2563eb; }
    .accent-fill { fill: #2563eb; }
    .soft-fill { fill: #2563eb; opacity: .08; }
    .ok { stroke: #16a34a; }
    @media (prefers-color-scheme: dark) {
      .outer { stroke: #3f3f46; }
      .card { fill: none; stroke: #3f3f46; }
      .muted { fill: #e4e4e7; opacity: .10; }
      .line { stroke: #71717a; }
      .accent { stroke: #60a5fa; }
      .accent-fill { fill: #60a5fa; }
      .soft-fill { fill: #60a5fa; opacity: .10; }
      .ok { stroke: #4ade80; }
    }
  </style>
  <rect x="1" y="1" width="1198" height="418" rx="24" class="outer" stroke-width="1"/>
  <path d="M154 210H1036" class="line" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 10"/>
  <path d="M250 210H282" class="line" stroke-width="2" stroke-linecap="round"/>
  <path d="M472 210H504" class="line" stroke-width="2" stroke-linecap="round"/>
  <path d="M694 210H726" class="line" stroke-width="2" stroke-linecap="round"/>
  <path d="M916 210H948" class="line" stroke-width="2" stroke-linecap="round"/>

  <g>
    <rect x="72" y="126" width="156" height="168" rx="18" class="card"/>
    <path d="M120 160H174M120 188H184M120 216H162" class="line" stroke-width="8" stroke-linecap="round"/>
    <path d="M112 252L132 272L188 216" class="accent" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g>
    <rect x="294" y="126" width="156" height="168" rx="18" class="card"/>
    <rect x="330" y="158" width="76" height="46" rx="10" class="soft-fill" stroke="#2563eb" stroke-opacity=".32"/>
    <rect x="350" y="188" width="76" height="46" rx="10" class="muted"/>
    <rect x="316" y="222" width="76" height="46" rx="10" class="muted"/>
  </g>

  <g>
    <rect x="516" y="126" width="156" height="168" rx="18" class="card"/>
    <path d="M552 166H636M552 210H636M552 254H612" class="line" stroke-width="8" stroke-linecap="round"/>
    <circle cx="548" cy="166" r="5" class="accent-fill"/>
    <circle cx="548" cy="210" r="5" class="accent-fill"/>
    <circle cx="548" cy="254" r="5" class="accent-fill"/>
  </g>

  <g>
    <rect x="738" y="126" width="156" height="168" rx="18" class="card"/>
    <circle cx="816" cy="210" r="48" class="soft-fill"/>
    <circle cx="816" cy="210" r="34" class="accent" stroke-width="4"/>
    <circle cx="816" cy="210" r="12" class="accent-fill"/>
    <path d="M816 156V176M816 244V264M762 210H782M850 210H870" class="accent" stroke-width="4" stroke-linecap="round"/>
  </g>

  <g>
    <rect x="960" y="126" width="156" height="168" rx="18" class="card"/>
    <path d="M1038 160L1082 180V218C1082 246 1066 264 1038 276C1010 264 994 246 994 218V180L1038 160Z" class="muted"/>
    <path d="M1014 218L1032 236L1064 202" class="ok" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

function candidates() {
  return [
    {
      id: 'rail',
      title: 'Minimal docs rail',
      purpose: 'Best for the docs page: a quiet Fumadocs-style line/card diagram that explains the sequence without overpowering prose.',
      alt: 'Ultragoal turns a large approved plan into one aggregate Codex goal, durable story milestones, a ledger, an explicit handoff, and final verification.',
      prompt: 'Create a documentation-learning figure for an Oh My CodeX / OMX tutorial page explaining Ultragoal. Make it look like an educational diagram inside technical documentation or a training handout, not a marketing hero image or abstract concept art. Use one horizontal rounded container with five concrete step panels connected by thin arrows: approved plan document, durable milestone card stack, ledger/checklist board, terminal-style handoff card connected to one goal orb, and final review shield. Match a Fumadocs/Tailwind docs page with crisp vector-like line art, neutral gray borders, muted off-white fills, sparse soft blue accent, and light shadow only. No readable text, letters, labels, pseudo-text, numbers, logos, screenshots, watermark, dark dramatic background, busy gradient, or photorealism.',
      svg: minimalDocsFlowSvg('ug-minimal'),
    },
    {
      id: 'orbit',
      title: 'Aggregate orbit',
      purpose: 'Good conceptual hero: emphasizes one aggregate goal with orbiting story checkpoints and evidence trail.',
      alt: 'One aggregate Ultragoal objective anchors multiple story checkpoints and a durable evidence trail.',
      prompt: 'Create an abstract language-neutral hero image for Ultragoal: one glowing aggregate objective in the center, multiple orbiting story checkpoints, and a durable evidence trail. Clean technical editorial vector style, no visible text.',
      svg: orbitSvg('ug-orbit'),
    },
    {
      id: 'handoff',
      title: 'Explicit handoff boundary',
      purpose: 'Best for explaining the shell/thread-state boundary: durable repo state stays separate until the active agent performs the goal handoff.',
      alt: 'Durable repo-side Ultragoal artifacts stay separate from hidden thread state until an explicit Codex goal handoff is performed.',
      prompt: 'Create a documentation illustration for Ultragoal showing a repo-side durable plan and ledger separated from hidden thread state by a clear boundary, with an explicit handoff to an active Codex goal and a final review gate. No visible words, labels, logos, or screenshots.',
      svg: handoffSvg('ug-handoff'),
    },
  ];
}

function sheetHtml(args, items, selected) {
  const mdxUrl = args.asset.replace(`${APPS[args.app]}/public`, '').replace(/\\/g, '/');
  const now = new Date().toISOString();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Docs image sheet — ${escapeHtml(args.topic)}</title>
  <style>
    :root { color-scheme: dark; --bg: #050915; --panel: #0b1220; --line: #23344f; --text: #e5edf9; --muted: #9fb0c8; --accent: #67e8f9; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: radial-gradient(circle at 20% 0%, rgba(37,99,235,.18), transparent 34%), var(--bg); color: var(--text); font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header { max-width: 1160px; margin: 0 auto 28px; }
    h1 { margin: 0 0 10px; font-size: clamp(28px, 4vw, 46px); line-height: 1.05; }
    h2 { margin: 0 0 12px; font-size: 22px; }
    p { margin: 0 0 10px; color: var(--muted); }
    code, textarea { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .meta, .card, .brief { border: 1px solid var(--line); background: rgba(11,18,32,.82); border-radius: 22px; box-shadow: 0 18px 50px rgba(0,0,0,.25); }
    .meta { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); padding: 18px; margin-top: 18px; }
    .brief { max-width: 1160px; margin: 0 auto 24px; padding: 20px; }
    .brief ul { margin: 10px 0 0 20px; padding: 0; color: var(--muted); }
    .grid { max-width: 1360px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 22px; align-items: start; }
    .card { padding: 18px; }
    .card.selected { outline: 2px solid var(--accent); }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border: 1px solid rgba(103,232,249,.45); color: #cffafe; border-radius: 999px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    .preview { overflow: hidden; border: 1px solid #1f3350; border-radius: 18px; margin: 14px 0; background: #020617; }
    .preview svg { display: block; width: 100%; height: auto; }
    textarea { width: 100%; min-height: 92px; resize: vertical; border: 1px solid #263957; border-radius: 14px; background: #050a14; color: #dbeafe; padding: 12px; }
    .snippet { padding: 12px; background: #050a14; border: 1px solid #263957; border-radius: 14px; color: #dbeafe; overflow: auto; }
    .alts { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    .alts div { border: 1px solid #263957; border-radius: 14px; padding: 12px; background: #050a14; }
    footer { max-width: 1160px; margin: 28px auto 0; color: var(--muted); }
  </style>
</head>
<body>
  <header>
    <span class="badge">HTML-first review sheet</span>
    <h1>Ultragoal docs image candidates</h1>
    <p>Self-contained sheet generated before committing the selected image, following the HTML-first recommendation: compare candidates, keep prompts and alt text next to the visual, then export one language-neutral SVG for docs.</p>
    <div class="meta">
      <div><strong>Generated</strong><br><code>${escapeHtml(now)}</code></div>
      <div><strong>Selected</strong><br><code>${escapeHtml(selected.id)} — ${escapeHtml(selected.title)}</code></div>
      <div><strong>Asset</strong><br><code>${escapeHtml(args.asset)}</code></div>
      <div><strong>MDX URL</strong><br><code>${escapeHtml(mdxUrl)}</code></div>
    </div>
  </header>

  <section class="brief">
    <h2>Image brief</h2>
    <p>Target page: <code>apps/codex/content/docs/skills/workflow/ultragoal*.mdx</code></p>
    <ul>
      <li>Make the durable-goal lifecycle obvious faster than prose.</li>
      <li>Do not put visible text in pixels so EN/KO/JA/ZH pages can reuse one image.</li>
      <li>Use repo-native SVG because this is a precise workflow diagram, not mood art.</li>
      <li>Reserve model-generated PNG for future hero/concept art where exact structure matters less.</li>
    </ul>
  </section>

  <main class="grid">
    ${items.map((item) => `<article class="card ${item.id === selected.id ? 'selected' : ''}">
      <span class="badge">${escapeHtml(item.id)}${item.id === selected.id ? ' · selected' : ''}</span>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.purpose)}</p>
      <div class="preview">${item.svg}</div>
      <p><strong>Alt text draft</strong></p>
      <div class="snippet">${escapeHtml(item.alt)}</div>
      <p><strong>Model prompt, if rasterizing later</strong></p>
      <textarea readonly>${escapeHtml(item.prompt)}</textarea>
    </article>`).join('\n')}
  </main>

  <section class="brief" style="margin-top: 24px;">
    <h2>Localized MDX snippets for selected asset</h2>
    <div class="alts">
      <div><strong>EN</strong><br><code>![Ultragoal turns a large approved plan into one aggregate Codex goal, durable story milestones, a ledger, an explicit handoff, and final verification.](${escapeHtml(mdxUrl)})</code></div>
      <div><strong>KO</strong><br><code>![Ultragoal이 큰 승인 계획을 하나의 aggregate Codex goal, durable story milestone, ledger, 명시적 handoff, 최종 검증으로 이어주는 흐름](${escapeHtml(mdxUrl)})</code></div>
      <div><strong>JA</strong><br><code>![Ultragoal が大きな承認済み計画を aggregate Codex goal、durable story milestones、ledger、明示的 handoff、final verification へつなぐ流れ](${escapeHtml(mdxUrl)})</code></div>
      <div><strong>ZH</strong><br><code>![Ultragoal 将大型已批准计划连接到一个 aggregate Codex goal、durable story milestones、ledger、明确 handoff 与 final verification 的流程](${escapeHtml(mdxUrl)})</code></div>
    </div>
  </section>

  <footer>
    <p>Stop condition: export the selected SVG, wire it into locale siblings, run localized-link check, lint, build, and Tailscale preview smoke checks.</p>
  </footer>
</body>
</html>`;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  const items = candidates();
  const selected = items.find((item) => item.id === args.pick);
  mkdirSync(path.dirname(path.resolve(args.sheet)), { recursive: true });
  writeFileSync(args.sheet, sheetHtml(args, items, selected), 'utf8');
  console.log(`[make-image-sheet] wrote ${args.sheet}`);
  if (!args.sheetOnly) {
    const assetPath = ensureAssetPath(args);
    writeFileSync(assetPath, `${selected.svg}\n`, 'utf8');
    console.log(`[make-image-sheet] wrote ${path.relative(process.cwd(), assetPath)}`);
  }
} catch (error) {
  console.error(`[make-image-sheet] ${error.message}`);
  process.exit(1);
}
