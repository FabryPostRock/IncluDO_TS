#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_wsl
activate_project_node

if (( $# == 0 )); then
  die "Nessun comando ricevuto. Uso: run-with-node.sh <comando> [argomenti...]"
fi

exec "$@"
