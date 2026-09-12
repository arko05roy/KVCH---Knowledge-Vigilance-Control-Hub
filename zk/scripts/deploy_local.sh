#!/usr/bin/env bash
# Local Anvil deployment + council activation + E2E.
# Usage: zk/scripts/deploy_local.sh
set -euo pipefail
ZK="$(cd "$(dirname "$0")/.." && pwd)"
FORGE="$HOME/.foundry/bin/forge"
CAST="$HOME/.foundry/bin/cast"
ANVIL_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ANVIL_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
RPC=http://127.0.0.1:8545

node "$ZK/scripts/prep_env.mjs" "$ANVIL_ADDR"

if ! curl -s -X POST $RPC -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -H 'content-type: application/json' | grep -q 0x7a69; then
  echo "start anvil first: anvil --port 8545" >&2; exit 1
fi

cd "$ZK/contracts"
set -a; source "$ZK/.env.deploy"; set +a
export DEPLOYER_KEY=$ANVIL_KEY
$FORGE script script/Deploy.s.sol --rpc-url $RPC --broadcast

COUNCIL=$(python3 -c "import json;print(json.load(open('deployments/latest.json'))['CouncilRegistry'])")
$CAST rpc evm_increaseTime 120 --rpc-url $RPC >/dev/null
$CAST rpc evm_mine --rpc-url $RPC >/dev/null
$CAST send "$COUNCIL" "activatePendingSet()" --private-key $ANVIL_KEY --rpc-url $RPC >/dev/null
echo "council set activated"

cd "$ZK"
node runtime/src/e2e.mjs --rpc $RPC --chain-id 31337 \
  --deployment contracts/deployments/latest.json \
  --publisher-key $ANVIL_KEY \
  --verifier-keys "$VERIFIER_KEY_1,$VERIFIER_KEY_2,$VERIFIER_KEY_3"
