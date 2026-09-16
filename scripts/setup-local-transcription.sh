#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$ROOT/.venv-transcription"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python 3 est requis pour la transcription locale."
  exit 1
fi

if [ ! -d "$VENV" ]; then
  echo "Création de l'environnement local Vogue Marry…"
  if ! "$PYTHON_BIN" -m venv "$VENV"; then
    echo
    echo "Le module venv manque. Sous Pop!_OS/Ubuntu :"
    echo "  sudo apt install python3-venv"
    echo "Puis relance : npm run transcription:setup"
    exit 1
  fi
fi

"$VENV/bin/python" -m pip install --upgrade pip
"$VENV/bin/python" -m pip install "faster-whisper>=1.1,<2"

"$VENV/bin/python" - <<'PY'
import faster_whisper
import av
print("Moteur local prêt : faster-whisper + PyAV")
PY

echo
echo "Vogue Marry peut maintenant transcrire localement, sans clé API."
echo "Le modèle Whisper sera téléchargé une seule fois au premier lancement."
