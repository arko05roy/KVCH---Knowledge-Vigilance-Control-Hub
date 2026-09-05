# Hosted Judge contract fixtures

From web/, run npm run test:judge. Requires Node >=22.18, python3 >=3.11,
and tar. Tests package real artifacts through the installed published
@arko05roy/kvch-extension package, inspect without execution, then execute
only these known fixtures in disposable directories.

To create an artifact for later upload testing:

```sh
npx kvch-extension pack test/fixtures/judge/node --output /tmp/node-concern.kvch.tgz
npx kvch-extension pack test/fixtures/judge/python --output /tmp/python-concern.kvch.tgz
```

Both fixtures contain their synthetic observations and baseline. No network,
credentials, external packages, or website configuration are needed.
KVCH_EVALUATION=1 produces no stdout; normal runs emit two complete JSONL
Finding Envelopes. These prove the contract, not the production execution
kernel, persistence, sandboxing, or queue.

Adapter keys are typescript/node and python/python3 with separate version 1.
Runtime declarations retain version constraints; selection identifies the
family only. The future execution kernel must enforce installed versions.
