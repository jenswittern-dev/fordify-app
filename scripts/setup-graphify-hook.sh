#!/usr/bin/env bash
# Fordify – Smart-Merge-Graphify-Hook installieren.
#
# Aufruf:   bash scripts/setup-graphify-hook.sh
# Idempotent. Überschreibt eine bestehende .git/hooks/post-commit ohne Rückfrage.
#
# Was passiert:
# 1. Verifiziert Git-Repo + scripts/git-hooks/post-commit vorhanden
# 2. Sucht Python-Interpreter mit graphify installiert
# 3. Kopiert scripts/git-hooks/post-commit -> .git/hooks/post-commit + chmod +x
#
# Hintergrund: Der von "graphify hook install" erzeugte Default-Hook nutzt
# graphify.watch._rebuild_code(), das destruktiv ist (überschreibt Graph
# mit AST-Only). Unser Smart-Merge erhält die semantische Schicht.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
    echo "Fehler: nicht in einem git-Repo." >&2
    exit 1
fi

HOOK_SRC="$REPO_ROOT/scripts/git-hooks/post-commit"
HOOK_DST="$REPO_ROOT/.git/hooks/post-commit"

if [ ! -f "$HOOK_SRC" ]; then
    echo "Fehler: $HOOK_SRC nicht gefunden." >&2
    exit 1
fi

# Python mit graphify suchen
PYTHON_BIN=""
for candidate in \
    "/c/Python314/python.exe" \
    "/c/Python313/python.exe" \
    "/c/Python312/python.exe" \
    "$(command -v python3 2>/dev/null || true)" \
    "$(command -v python 2>/dev/null || true)"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
        if "$candidate" -c "import graphify" >/dev/null 2>&1; then
            PYTHON_BIN="$candidate"
            break
        fi
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo "Warnung: kein Python-Interpreter mit graphify gefunden." >&2
    echo "Hook wird trotzdem installiert (Detection läuft beim Commit erneut)." >&2
    echo "Falls es nicht funktioniert: pip install graphifyy" >&2
fi

# Hook installieren
mkdir -p "$REPO_ROOT/.git/hooks"
cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"

echo "Hook installiert: $HOOK_DST"
if [ -n "$PYTHON_BIN" ]; then
    echo "Erkannter Python-Interpreter: $PYTHON_BIN"
fi
echo ""
echo "Test: nächster git commit mit Code-Datei zeigt '[graphify hook]'-Output."
echo "Bei Doc-only-Commits exit'd der Hook still (by design)."
