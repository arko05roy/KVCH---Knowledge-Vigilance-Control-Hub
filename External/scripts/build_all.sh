#!/usr/bin/env bash
set -e

export PYTHONDONTWRITEBYTECODE=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTERNAL_DIR="$(dirname "$SCRIPT_DIR")"
ARTIFACTS_DIR="$EXTERNAL_DIR/artifacts"

mkdir -p "$ARTIFACTS_DIR"

# Clean any python bytecode caches
find "$EXTERNAL_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

EXTENSIONS=(
  "attack-surface-scanner"
  "vpn-crypto-analyzer"
  "phishing-hunter"
  "threat-hunter-3000"
  "malware-analyzer"
  "credential-exposure-auditor"
  "supply-chain-auditor"
  "cookie-xss-auditor"
)

echo "=========================================================================="
echo "KVCH EXTENSION BUILDER - BUILDING ALL 8 EXTENSIONS"
echo "=========================================================================="
echo "Output Artifacts Directory: $ARTIFACTS_DIR"
echo ""

SUMMARY_FILE="$ARTIFACTS_DIR/build_summary.json"
echo "{" > "$SUMMARY_FILE"
echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$SUMMARY_FILE"
echo "  \"artifacts\": [" >> "$SUMMARY_FILE"

FIRST=true

for EXT in "${EXTENSIONS[@]}"; do
  EXT_PATH="$EXTERNAL_DIR/$EXT"
  OUT_TGZ="$ARTIFACTS_DIR/$EXT.kvch.tgz"

  echo "--------------------------------------------------------------------------"
  echo "▶ Processing Extension: $EXT"
  echo "--------------------------------------------------------------------------"

  # Clean pycache inside extension
  find "$EXT_PATH" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

  # 1. Validate
  echo "1. Validating $EXT..."
  npx @arko05roy/kvch-extension validate "$EXT_PATH"

  # 2. Pack
  echo "2. Packing $EXT to $OUT_TGZ..."
  npx @arko05roy/kvch-extension pack "$EXT_PATH" --output "$OUT_TGZ"

  # 3. Inspect
  echo "3. Inspecting $OUT_TGZ..."
  npx @arko05roy/kvch-extension inspect "$OUT_TGZ"

  # 4. SHA-256 Hash
  echo "4. Computing SHA-256 Hash..."
  HASH_OUTPUT=$(npx @arko05roy/kvch-extension hash "$OUT_TGZ")
  echo "$HASH_OUTPUT"

  HASH_VAL=$(echo "$HASH_OUTPUT" | awk '{print $1}')
  SIZE_BYTES=$(wc -c < "$OUT_TGZ" | tr -d ' ')

  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo "," >> "$SUMMARY_FILE"
  fi

  echo "    {" >> "$SUMMARY_FILE"
  echo "      \"id\": \"$EXT\"," >> "$SUMMARY_FILE"
  echo "      \"artifact\": \"$EXT.kvch.tgz\"," >> "$SUMMARY_FILE"
  echo "      \"sha256\": \"$HASH_VAL\"," >> "$SUMMARY_FILE"
  echo "      \"size_bytes\": $SIZE_BYTES" >> "$SUMMARY_FILE"
  echo "    }" >> "$SUMMARY_FILE"

  echo "✔ Successfully built and packed $EXT"
  echo ""
done

echo "  ]" >> "$SUMMARY_FILE"
echo "}" >> "$SUMMARY_FILE"

echo "=========================================================================="
echo "SUMMARY OF PACKAGED KVCH EXTENSIONS"
echo "=========================================================================="
cat "$SUMMARY_FILE"
echo ""
echo "✔ All 8 extensions built, validated, packed, and hashed successfully!"
