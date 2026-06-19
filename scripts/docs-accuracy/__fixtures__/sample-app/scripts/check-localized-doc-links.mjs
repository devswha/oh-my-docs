// Fixture app link checker: re-export the real gajae-code checker so the fixture exercises the
// exact same code the build gate uses (single source of truth). Parameterized via {docsDir,rootDir}.
export * from "../../../../../apps/gajae-code/scripts/check-localized-doc-links.mjs";
