#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_wsl
activate_project_node
cd "$PROJECT_DIR"

info "Node attivo: $(node --version)"
info "npm attivo: $(npm --version)"

if [[ ! -f package.json ]]; then
  info "package.json non trovato: inizializzazione del progetto npm."
  npm init -y
else
  info "package.json già presente: non viene ricreato."
fi

required_dev_packages=(
  typescript
  @types/node
  tsx
  prettier
  eslint
  @eslint/js
  typescript-eslint
  globals
)

missing_dev_packages=()
for package_name in "${required_dev_packages[@]}"; do
  if npm_package_installed "$package_name"; then
    info "$package_name è già installato localmente."
  else
    missing_dev_packages+=("$package_name")
  fi
done

if (( ${#missing_dev_packages[@]} > 0 )); then
  info "Installazione dei pacchetti mancanti: ${missing_dev_packages[*]}"
  npm install --save-dev "${missing_dev_packages[@]}"
else
  info "TypeScript e tutti gli strumenti richiesti sono già installati."
fi

# Inserisce o aggiorna esclusivamente gli script npm usati dal workspace.
node <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packagePath = resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

packageJson.private ??= true;
packageJson.type ??= 'module';
packageJson.main = './dist/index.js';
packageJson.scripts = {
  ...packageJson.scripts,
  build: 'tsc -p tsconfig.json',
  'build:watch': 'tsc -p tsconfig.json --watch --preserveWatchOutput',
  typecheck: 'tsc -p tsconfig.json --noEmit',
  prestart: 'npm run build',
  start: 'node ./dist/index.js',
  dev: 'tsx watch --include "src/**/*.ts" src/index.ts',
  'dev:once': 'npm run typecheck && tsx src/index.ts',
  lint: 'eslint .',
  'lint:fix': 'eslint . --fix',
  format: 'prettier --write .',
  'format:check': 'prettier --check .',
  check: 'npm run typecheck && npm run lint && npm run format:check',
};

writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
NODE

if [[ ! -f tsconfig.json ]]; then
  info "Creazione di tsconfig.json."
  cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true,
    "inlineSources": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "noEmitOnError": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
JSON
else
  info "tsconfig.json già presente: non viene sovrascritto."
fi

if [[ ! -f .prettierrc.json && ! -f .prettierrc ]]; then
  info "Creazione di .prettierrc.json."
  cat > .prettierrc.json <<'JSON'
{
  "printWidth": 120,
  "singleQuote": true,
  "semi": true
}
JSON
else
  info "Configurazione Prettier già presente: non viene sovrascritta."
fi

if [[ ! -f eslint.config.mjs && ! -f eslint.config.js ]]; then
  info "Creazione di eslint.config.mjs."
  cat > eslint.config.mjs <<'JAVASCRIPT'
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    languageOptions: {
      globals: globals.node,
    },
  },
);
JAVASCRIPT
else
  info "Configurazione ESLint già presente: non viene sovrascritta."
fi

mkdir -p src
if [[ ! -f src/index.ts ]]; then
  info "Creazione del file dimostrativo src/index.ts."
  cat > src/index.ts <<'TYPESCRIPT'
interface Greeting {
  recipient: string;
  message: string;
}

const greeting: Greeting = {
  recipient: 'WSL',
  message: 'TypeScript è configurato correttamente',
};

console.log(`${greeting.message} per ${greeting.recipient}.`);
TYPESCRIPT
else
  info "src/index.ts già presente: non viene sovrascritto."
fi

info "Verifica finale degli eseguibili locali."
npm exec -- tsc --version
npm exec -- tsx --version
npm exec -- eslint --version
npm exec -- prettier --version

info "Installazione e configurazione TypeScript completate."
