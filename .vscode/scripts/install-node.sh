#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_wsl
cd "$PROJECT_DIR"

info "Workspace: $PROJECT_DIR"
info "Distribuzione WSL: ${WSL_DISTRO_NAME:-non dichiarata}"

# Se Node e npm Linux sono già disponibili, non viene eseguita alcuna installazione.
if command_exists node && command_exists npm && node_meets_minimum; then
  info "Node.js è già installato in WSL: $(node --version)"
  info "npm è già installato in WSL: $(npm --version)"
  info "Percorso Node: $(command -v node)"
  exit 0
fi

if command_exists node && node_is_linux; then
  warn "Node.js $(node --version) è presente, ma è precedente alla versione minima ${MIN_NODE_MAJOR}."
fi

info "Un runtime Node.js Linux compatibile non è stato trovato. Verrà installato tramite NVM."

missing_apt_packages=()
for package_name in curl ca-certificates git; do
  dpkg -s "$package_name" >/dev/null 2>&1 || missing_apt_packages+=("$package_name")
done

if (( ${#missing_apt_packages[@]} > 0 )); then
  info "Installazione prerequisiti APT: ${missing_apt_packages[*]}"
  command_exists sudo || die "sudo non è disponibile: impossibile installare i prerequisiti APT."
  sudo apt-get update
  sudo apt-get install -y "${missing_apt_packages[@]}"
else
  info "I prerequisiti APT sono già installati."
fi

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  NVM_VERSION="${NVM_VERSION:-v0.40.6}"
  info "NVM non è installato. Installazione della versione $NVM_VERSION..."
  NVM_DIR="$NVM_DIR" PROFILE=/dev/null bash -c "curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh | bash"
else
  info "NVM è già presente in $NVM_DIR."
fi

load_nvm || die "NVM non può essere caricato da $NVM_DIR/nvm.sh."

if [[ -f "$PROJECT_DIR/.nvmrc" ]]; then
  requested_node="$(tr -d '[:space:]' < "$PROJECT_DIR/.nvmrc")"
else
  requested_node="lts/*"
  printf '%s\n' "$requested_node" > "$PROJECT_DIR/.nvmrc"
  info "Creato .nvmrc con la versione $requested_node."
fi

if [[ "$(nvm version "$requested_node")" == "N/A" ]]; then
  info "La versione Node richiesta ($requested_node) non è installata: avvio nvm install."
  nvm install "$requested_node"
else
  info "La versione Node richiesta ($requested_node) è già installata in NVM."
fi

nvm use "$requested_node"
nvm alias default "$requested_node" >/dev/null

node_is_linux || die "L'installazione ha prodotto un runtime Node non Linux."
node_meets_minimum || die "La versione Node installata non soddisfa il requisito minimo ${MIN_NODE_MAJOR}."

info "Installazione Node completata."
info "Node: $(node --version)"
info "npm: $(npm --version)"
info "Percorso Node: $(command -v node)"
