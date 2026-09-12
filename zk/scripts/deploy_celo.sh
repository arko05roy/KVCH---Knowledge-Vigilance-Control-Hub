#!/usr/bin/env bash
# Celo Sepolia deployment + council activation + E2E.
# Usage: KVCH_DEPLOYER_KEY=0x... zk/scripts/deploy_celo.sh
set -euo pipefail
ZK="$(cd "$(dirname "$0")/.." && pwd)"
FORGE="$HOME/.foundry/bin/forge"
CAST="$HOME/.foundry/bin/cast"
RPC=${KVCH_RPC:-https://forno.celo-sepolia.celo-testnet.org}
: "${KVCH_DEPLOYER_KEY:?set KVCH_DEPLOYER_KEY env var}"

DEPLOYER_ADDR=$($CAST wallet address --private-key "$KVCH_DEPLOYER_KEY")
echo "deployer: $DEPLOYER_ADDR"
node "$ZK/scripts/prep_env.mjs" "$DEPLOYER_ADDR"

cd "$ZK/contracts"
set -a; source "$ZK/.env.deploy"; set +a
export DEPLOYER_KEY=$KVCH_DEPLOYER_KEY
$FORGE script script/Deploy.s.sol --rpc-url "$RPC" --broadcast

COUNCIL=$(python3 -c "import json;print(json.load(open('deployments/latest.json'))['CouncilRegistry'])")
AFTER=$(python3 -c "import json;print(json.load(open('deployments/latest.json'))['pendingActivateAfter'])")
NOW=$(date +%s)
if [ "$AFTER" -gt "$NOW" ]; then
  echo "waiting $((AFTER-NOW+5))s for council activation delay"
  sleep $((AFTER-NOW+5))
fi
$CAST send "$COUNCIL" "activatePendingSet()" --private-key "$KVCH_DEPLOYER_KEY" --rpc-url "$RPC"
echo "council set activated"

cd "$ZK"
node runtime/src/e2e.mjs --rpc "$RPC" --chain-id 11142220 \
  --deployment contracts/deployments/latest.json \
  --publisher-key "$KVCH_DEPLOYER_KEY" \
  --verifier-keys "$VERIFIER_KEY_1,$VERIFIER_KEY_2,$VERIFIER_KEY_3"
