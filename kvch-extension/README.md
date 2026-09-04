# KVCH Extension Bridge

`@arko05roy/kvch-extension` turns a standalone extension folder into an immutable KVCH candidate artifact. Builders use it locally; KVCH uses the uploaded artifact bytes as the input to evaluation, approval, activation, and monitoring.

```text
Extension source folder
  → validate
  → pack
  → .kvch.tgz artifact + local SHA-256
  → upload the artifact to KVCH
  → KVCH stores bytes and calculates the authoritative SHA-256
  → evaluation, approval, activation, and monitoring
```

The package never runs extension code while validating, packaging, inspecting, or hashing it. It does not contact KVCH, upload files, make approval decisions, or deploy an extension.

## Who uses what

| Builder with this package | KVCH website and backend |
| --- | --- |
| Authors and tests an extension independently. | Receives the `.kvch.tgz` upload. |
| Validates its manifest and folder structure. | Stores the exact uploaded bytes. |
| Creates a deterministic artifact and displays a local hash. | Recomputes the authoritative hash from stored bytes. |
| Hands the artifact to KVCH. | Evaluates, approves, activates, and monitors that exact hash. |

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

An extension folder must include `extension.yaml`, `README.md`, a `src/` directory, and the manifest-declared entrypoint. The manifest defines its language, runtime, commands, input/output contract, and managed-runtime compatibility.

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

Treat the artifact as immutable after it has been evaluated. A changed byte is a different candidate and must repeat KVCH’s evaluation and approval flow.

## Handing off to KVCH

1. Upload the `.kvch.tgz` file to the KVCH website.
2. Compare the website’s server-computed SHA-256 with the value printed locally.
3. Use the website’s artifact record—not a builder-supplied hash—as the identity for evaluation, approval, activation, and monitoring.
4. Only an approved activation may create a monitored installation. Runtime heartbeats and findings must report the artifact hash actually loaded.

The upload, Judge evaluation, whitelist decision, activation, deployment, and monitoring interfaces are intentionally website responsibilities. They are not implemented in, or bypassable through, this npm package.

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
