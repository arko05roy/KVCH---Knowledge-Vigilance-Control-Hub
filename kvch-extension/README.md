# KVCH Extension Bridge

`@arko05roy/kvch-extension` turns a standalone extension folder into an immutable KVCH artifact. Builders use it locally; KVCH uses the uploaded artifact bytes as the input to KVCH Judge evaluation, scheduled deployment, and monitoring.

```text
Extension source folder
  → validate
  → pack
  → .kvch.tgz artifact + local SHA-256
  → upload the artifact to KVCH
  → KVCH stores bytes and calculates the authoritative SHA-256
  → KVCH Judge evaluation, scheduled deployment, and monitoring
```

The package never runs extension code while validating, packaging, inspecting, or hashing it. It does not contact KVCH, upload files, make approval decisions, or deploy an extension.

## Who uses what

| Builder with this package | KVCH website and backend |
| --- | --- |
| Authors and tests an extension independently. | Receives the `.kvch.tgz` upload. |
| Validates its manifest and folder structure. | Stores the exact uploaded bytes. |
| Creates a deterministic artifact and displays a local hash. | Recomputes the authoritative hash from stored bytes. |
| Hands the artifact to KVCH. | Evaluates, deploys, and monitors that exact hash. |

The hash is an artifact identity, not a secret and not a deployment credential. Upload the `.kvch.tgz` file, not only its hash. KVCH must always calculate its own hash after storing the uploaded bytes; the local value is a preflight comparison.

## Install

Requires Node.js 22 or later.

Install it in the extension workspace without a global installation:

```sh
npm install --save-dev @arko05roy/kvch-extension
npx kvch-extension --help
```

Or install it globally:

```sh
npm install -g @arko05roy/kvch-extension
```

## Package an extension

An extension folder must include `extension.yaml`, `README.md`, a `src/` directory, and the manifest-declared entrypoint. The manifest defines its language, runtime, commands, input/output contract, and immutable KVCH deployment schedule.

```sh
# Explain any manifest, source layout, entrypoint, or npm-script errors.
kvch-extension validate ./my-extension

# Create the immutable candidate artifact. The printed hash is the local preflight ID.
kvch-extension pack ./my-extension --output ./my-extension.kvch.tgz

# View only artifact metadata and its manifest; no extension code is executed.
kvch-extension inspect ./my-extension.kvch.tgz

# Reprint the SHA-256 of an existing artifact.
kvch-extension hash ./my-extension.kvch.tgz
```

Example output from `pack`:

```text
Packed /absolute/path/my-extension.kvch.tgz
SHA-256: 9b6d…
Size: 12345 bytes
```

## Artifact guarantees

`pack` creates a deterministic gzip-compressed ustar artifact. It canonicalizes file order, ownership, timestamps, and permissions, so an unchanged extension folder produces byte-identical artifacts and the same hash. Any included manifest or source change produces a new artifact and hash.

The artifact includes the extension's regular package files. It excludes local/generated state such as `node_modules`, `dist`, `.git`, and `.DS_Store`. Symlinks and special filesystem entries are rejected to prevent an artifact from referring outside the extension folder.

Treat the artifact as immutable after it has been evaluated. A changed byte is a different candidate and must repeat KVCH Judge evaluation before it can be deployed.

## KVCH hosted-runtime contract

For KVCH's hosted cron runtime, `extension.yaml` must contain a five-field `deployment.schedule`, such as `*/5 * * * *`. The package verifies that the schedule parses as cron and exposes it from `validate` and `inspect`; KVCH applies its own low-frequency scheduling limits when it deploys the artifact.

The package validates only static package structure. The extension author must implement the following runtime behavior, which KVCH Judge verifies after upload:

1. `commands.install`, `commands.build`, and `commands.run` work from the extension root.
2. With `KVCH_EVALUATION=1` and `{}` on standard input, `commands.run` exits `0` without contacting its normal target and writes no finding output.
3. On a normal scheduled run, exit `0` with empty standard output means the extension is healthy.
4. If a concern is found, each non-empty standard-output line is one JSON object following KVCH's Finding Envelope. The extension may emit more than one line/finding per run.

KVCH supplies no use-case-specific configuration during a hosted run. The artifact itself owns its links, service logic, baselines, and detector behavior. KVCH Judge checks that the package builds, runs, exits, and emits valid output; it does not decide whether the detector is semantically correct.

## Handing off to KVCH

1. Upload the `.kvch.tgz` file to the KVCH website.
2. Compare the website’s server-computed SHA-256 with the value printed locally.
3. Use the website’s artifact record—not a builder-supplied hash—as the identity for Judge evaluation, deployment, scheduled runs, and monitoring.
4. After a passing evaluation, KVCH deploys the exact stored hash at the immutable schedule declared in the artifact.

The upload, KVCH Judge, deployment, scheduling, and monitoring interfaces are intentionally website responsibilities. They are not implemented in, or bypassable through, this npm package.

## Library API

```ts
import {
  createArtifact,
  inspectArtifactBytes,
  validateExtension,
} from "@arko05roy/kvch-extension";

const validation = await validateExtension("./my-extension");
if (!validation.valid) {
  console.error(validation.issues);
  process.exit(1);
}

const artifactBytes = await createArtifact("./my-extension");
const artifact = inspectArtifactBytes(artifactBytes);
console.log(artifact.artifactSha256);
```

The exported `RuntimeAdapter` type is an integration boundary for KVCH runtime adapters. It does not itself select, launch, or govern a runtime.

## Development and release

```sh
npm install
npm run check
npm test
npm pack --dry-run
```

`prepublishOnly` runs the full test suite before publishing. This package is published as `@arko05roy/kvch-extension`.

## License

Copyright © KVCH. All rights reserved.
