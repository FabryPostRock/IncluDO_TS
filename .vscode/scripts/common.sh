#!/usr/bin/env bash

# Funzioni condivise dagli script di configurazione del workspace.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
MIN_NODE_MAJOR="${MIN_NODE_MAJOR:-22}"

info() {
  printf '[INFO] %s\n' "$*"
}

warn() {
  printf '[ATTENZIONE] %s\n' "$*" >&2
}

die() {
  printf '[ERRORE] %s\n' "$*" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

is_wsl() {
  [[ -n "${WSL_DISTRO_NAME:-}" || -n "${WSL_INTEROP:-}" ]] && return 0

  [[ -r /proc/sys/kernel/osrelease ]] && grep -qiE 'microsoft|wsl' /proc/sys/kernel/osrelease && return 0
  [[ -r /proc/version ]] && grep -qiE 'microsoft|wsl' /proc/version && return 0

  return 1
}

require_wsl() {
  [[ "$(uname -s)" == "Linux" ]] || die "Questo script deve essere eseguito in Linux/WSL."
  is_wsl || die "Linux rilevato, ma non WSL. Apri il progetto con l'estensione Remote - WSL."
}

load_nvm() {
  [[ -s "$NVM_DIR/nvm.sh" ]] || return 1

  # Alcune versioni di nvm leggono variabili facoltative: si disattiva
  # temporaneamente nounset mentre viene caricato il file nvm.sh.
  local nounset_enabled=0
  [[ $- == *u* ]] && nounset_enabled=1 && set +u
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
  (( nounset_enabled == 1 )) && set -u

  command_exists nvm
}

node_is_linux() {
  command_exists node || return 1
  [[ "$(node -p 'process.platform' 2>/dev/null)" == "linux" ]]
}

node_meets_minimum() {
  node_is_linux || return 1
  local node_major
  node_major="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null)"
  [[ "$node_major" =~ ^[0-9]+$ ]] && (( node_major >= MIN_NODE_MAJOR ))
}

activate_project_node() {
  cd "$PROJECT_DIR"

  if load_nvm; then
    if [[ -f "$PROJECT_DIR/.nvmrc" ]]; then
      if ! nvm use --silent >/dev/null; then
        die "La versione Node richiesta da .nvmrc non è installata. Esegui il task 'Node Setup: Installa Node in WSL'."
      fi
    elif ! nvm use --silent default >/dev/null; then
      die "NVM è presente, ma non esiste una versione Node predefinita."
    fi
  fi

  command_exists node || die "Node.js non è disponibile nel PATH WSL."
  command_exists npm || die "npm non è disponibile nel PATH WSL."
  node_is_linux || die "Il comando node non usa un runtime Linux. Non usare Node installato su Windows."
  node_meets_minimum || die "È richiesto Node.js ${MIN_NODE_MAJOR} o superiore. Esegui il task di installazione Node."
}

npm_package_installed() {
  local package_name="$1"
  npm ls "$package_name" --depth=0 >/dev/null 2>&1
}
