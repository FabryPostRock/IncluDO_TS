#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_wsl
activate_project_node
cd "$PROJECT_DIR"

printf '\n=== Sistema ===\n'
printf 'Distribuzione WSL: %s\n' "${WSL_DISTRO_NAME:-non dichiarata}"
printf 'Kernel: %s\n' "$(uname -r)"
printf 'Workspace: %s\n' "$PROJECT_DIR"

printf '\n=== Node.js ===\n'
printf 'Node: %s\n' "$(node --version)"
printf 'npm: %s\n' "$(npm --version)"
printf 'node path: %s\n' "$(command -v node)"
printf 'npm path: %s\n' "$(command -v npm)"
printf 'platform/arch: %s/%s\n' "$(node -p 'process.platform')" "$(node -p 'process.arch')"

printf '\n=== TypeScript e strumenti locali ===\n'
[[ -x node_modules/.bin/tsc ]] || die "TypeScript locale non trovato. Esegui il task di installazione TypeScript."
[[ -x node_modules/.bin/tsx ]] || die "tsx locale non trovato. Esegui il task di installazione TypeScript."
[[ -x node_modules/.bin/eslint ]] || die "ESLint locale non trovato."
[[ -x node_modules/.bin/prettier ]] || die "Prettier locale non trovato."

printf 'TypeScript: %s\n' "$(npm exec -- tsc --version)"
printf 'tsx: %s\n' "$(npm exec -- tsx --version | tail -n 1)"
printf 'ESLint: %s\n' "$(npm exec -- eslint --version)"
printf 'Prettier: %s\n' "$(npm exec -- prettier --version)"

printf '\n=== File di configurazione ===\n'
for config_file in package.json tsconfig.json eslint.config.mjs .prettierrc.json; do
  if [[ -f "$config_file" ]]; then
    printf 'OK  %s\n' "$config_file"
  else
    printf 'MANCANTE  %s\n' "$config_file"
  fi
done

printf '\n=== Controllo TypeScript ===\n'
npm run typecheck

printf '\nAmbiente WSL TypeScript verificato correttamente.\n'
