---
name: kvch-extension-builder
description: Build a standalone, composable extension package for any requested monitoring, analysis, reminder, prevention, or automation use case. Use when the user wants an extension created; do not use for publishing, authorization, company setup, or web-platform integration.
---

# KVCH Extension Builder

Build a real, standalone extension package from a user's idea. The extension may be written in any suitable language—TypeScript, Python, or another ecosystem supported by the target environment—and may use the libraries its job requires.

This skill owns extension creation only. It does not publish an extension, require a KVCH account, call a KVCH API, assign permissions, or decide how a future website installs/runs it. Those concerns will consume the package later.

## Deliverable

Create one self-contained folder using this stable shape:

```text
<extension-id>/
├── extension.yaml             # language-agnostic package manifest
├── README.md                  # what it does, prerequisites, and commands
├── src/                       # implementation in the chosen language
├── tests/                     # automated tests
├── fixtures/                  # safe, reproducible test/demo data when useful
├── scripts/                   # build, run, or packaging helpers when useful
├── dist/                      # generated distributable output; do not commit
└── <language package files>   # e.g. package.json, pyproject.toml, requirements.txt
```

The structure stays the same; implementation language, libraries, source layout under `src/`, and runtime behavior are selected for the use case. Do not add KVCH-specific dependencies unless a later task explicitly introduces integration.

## Build flow

1. Understand the extension's job: what it observes or receives, what it decides, what it produces, and when it runs.
2. Inspect the target project if one exists. Reuse its language, package manager, and integration conventions when they suit the job.
3. Choose the language and libraries that genuinely fit the task. For example, a Git configuration monitor may use TypeScript and Git hooks; a packet analyzer may use Python and packet/OWASP libraries.
4. Create `extension.yaml` before implementation, then implement actual working code in `src/`.
5. Add tests and safe fixtures. Test the normal behavior, the requested concern, and meaningful edge cases.
6. Add executable install, run, test, build, and package commands to the language-native package configuration or `scripts/`.
7. Run the available build and tests. Fix failures before handing off.
8. Write a concise README that lets another builder install, run, test, and package it without guessing.

Do not leave TODOs, placeholder functions, pseudocode, or a fake detector in place of requested functionality. If live functionality requires a device, OS capability, credentials, or a network, implement the real adapter and also provide a safe fixture/demo path when possible. State the live prerequisite plainly in the README.

Ask one concise question only when a missing fact materially changes what the extension must do. Otherwise make reasonable technical choices and build the package.

## `extension.yaml` manifest

Every extension has this language-agnostic manifest. It describes the package; it does not prescribe the extension's internal code or grant any permission.

```yaml
schema_version: kvch.extension-package/v1
id: gitignore-env-variable-monitor
name: Gitignore environment-variable monitor
version: 0.1.0
description: Detects environment-specific variables that are not safely ignored before Git actions.

implementation:
  language: typescript # typescript | python | another language identifier
  runtime: node >=22
  package_manager: npm
  entrypoint: src/index.ts

commands:
  install: npm install
  run: npm run start
  test: npm test
  build: npm run build
  package: npm run package

interface:
  mode: event # event | cli | service | library
  inputs:
    - name: repository_path
      description: Absolute or working-directory-relative repository path.
  outputs:
    - name: findings
      description: Detected concerns and recommended next actions.

behavior:
  normal: Environment-specific variables are excluded according to the configured rule set.
  concern: A tracked or staged file contains an environment-specific variable that should be ignored.
  edge_cases:
    - Deliberately committed example configuration files.
    - Variables with non-sensitive placeholder values.

dependencies:
  runtime: []
  system: []
  configuration: []
```

Manifest rules:

- `id` is lowercase kebab-case and stable for the same conceptual extension.
- `version` follows the chosen package ecosystem's versioning convention; update it when behavior changes.
- `implementation` exactly identifies how a future consumer can run the package.
- `commands` must be real commands that work from the extension root after prerequisites are installed.
- `interface.mode` means:
  - `event`: reacts to a hook, file event, callback, or supplied event;
  - `cli`: performs work from command-line arguments/stdin;
  - `service`: runs continuously and exposes a documented local interface;
  - `library`: exports code for another application to call.
- `dependencies` lists non-obvious system tools, credentials, or configuration. Normal package dependencies belong in the language package file too.

## Composition rules

An extension must be independently buildable and testable. Keep the domain logic separate from environment-specific adapters whenever that improves reuse:

```text
src/
├── core/        # detection, analysis, transformation, or decision logic
├── adapters/    # Git, filesystem, packet capture, CLI, browser, cloud, etc.
└── index.*      # documented package entrypoint
```

This is a recommended internal layout, not a constraint on simple extensions. What must remain stable is the package root, manifest, entrypoint, commands, README, and tests.

Inputs and outputs are the extension's own contract. Define them in the manifest and README clearly enough that a future website, CLI, or another extension can call the package without reading implementation internals. Do not assume a future platform protocol exists yet.

## Quality bar

Before completion, verify:

- The implementation does the requested job with actual code and selected libraries.
- The manifest matches the actual language, entrypoint, commands, inputs, outputs, and dependencies.
- A fresh builder can follow the README to install, run, test, build, and package the extension.
- Tests cover normal behavior, the requested concern, and declared edge cases.
- Fixtures are safe: no real secrets, credentials, personal data, or production packet captures.
- The package can be used without KVCH or any web application being built.

## Example interpretation

For “monitor my `.gitignore` and remind me when environment-specific variables are pushed,” create a package that reads the repository's Git and ignore configuration, inspects the chosen Git event or staged files, applies configurable environment-variable rules, emits actionable findings, and includes fixtures for ignored files, example configs, and a risky staged file.

Whether the implementation uses TypeScript with a Git hook, Python with a CLI, or another suitable approach is an implementation choice. The package structure and manifest remain the same.
