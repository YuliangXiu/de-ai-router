#!/bin/sh
# Install a pre-commit hook that scans staged markdown for AI slop.
# Usage: scripts/install-git-hook.sh [threshold]   (default threshold: 50)
set -e

THRESHOLD="${1:-50}"
ROOT="$(git rev-parse --show-toplevel)"
KIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-commit"

cat > "$HOOK" <<EOF
#!/bin/sh
# soundshuman slop gate (installed by install-git-hook.sh)
FILES=\$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(md|mdx|markdown|txt)\$' || true)
[ -z "\$FILES" ] && exit 0
STATUS=0
for f in \$FILES; do
  SCORE=\$(git show ":\$f" | node "$KIT_DIR/bin/sloplint.js" score --json | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).score))')
  if [ "\$SCORE" -ge "$THRESHOLD" ]; then
    echo "slop gate: \$f scores \$SCORE/100 (threshold $THRESHOLD)"
    echo "  run: node $KIT_DIR/bin/sloplint.js analyze \$f"
    STATUS=1
  fi
done
[ "\$STATUS" -ne 0 ] && echo "commit blocked; rewrite or use --no-verify to override"
exit \$STATUS
EOF

chmod +x "$HOOK"
echo "installed pre-commit slop gate (threshold $THRESHOLD) at $HOOK"
