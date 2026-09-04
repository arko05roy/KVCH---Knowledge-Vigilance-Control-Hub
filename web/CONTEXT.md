# KVCH Internal Workbench

This context defines the language for KVCH's internal workbench, which helps employees work safely while governing consequential actions.

## Language

**Internal Security Control Flow**:
The governed lifecycle that prevents, contains, or routes internally initiated cyber-risk actions from observation or request through verified outcome.
_Avoid_: PR flow, intern workflow, stop every attack

**Junior Developer Scenario**:
A first-persona scenario used to exercise an **Internal Security Control Flow** through actions such as code changes, secret handling, access requests, and deployment work.

**Security Extension**:
A declared, policy-governed package that adds detection, context enrichment, or bounded remediation for a specific internal cyber-risk pattern.
_Avoid_: plugin, unrestricted script

**Extension Publisher**:
An authorized company member delegated by upstream management to create and publish **Security Extensions** within a defined organizational and capability scope.
_Avoid_: arbitrary user, extension owner

**Extension Mandate**:
The management-approved statement of a cyber-risk problem, intended outcome, organizational scope, and accountable owner that authorizes an incident-driven **Security Extension**.

**Approval Ladder**:
The policy-selected chain of authorized reviewers that can move an internal cyber-risk action or incident-driven **Security Extension** from lower operational roles to executive leadership.

**Employee-Originated Incident**:
An internal cyber-risk event materially caused by an employee action, omission, or policy breach.

**Upstream Escalation**:
An authorized recipient's explicit request to widen an incident's visibility and decision authority to the next applicable level of the **Approval Ladder**.

**Preventive Extension**:
An active **Security Extension** whose declared control can block or hold an in-scope action when its defined risk condition is met.

**Extension Target**:
An organizational or technical scope—such as an organization, team, repository, environment, or action type—where a published **Security Extension** runs automatically.

**Break-Glass Release**:
A time-limited, audited exception that permits a blocked action only under policy-defined elevated authority and recorded justification.

**Report Extension**:
An active **Security Extension** that observes an in-scope action or state and creates a reportable incident without claiming to prevent the original action.

**Escalation Route**:
The ordered sequence of roles configured by a **Security Extension** that determines who is notified first and who may receive an incident on manual or policy-triggered escalation.

**Role Projection**:
An authorized, role-appropriate rendering of an incident that exposes only the evidence, impact, and actions relevant to its recipient.

**Extension Tracking ID**:
The immutable cryptographic hash of the exact evaluated extension artifact, used for monitoring, audit, and case linkage.

**Extension Authoring Assistant**:
An AI skill and tool interface that helps an **Extension Publisher** compose a valid **Security Extension** within their delegated scope.

**Extension Contract**:
The small stable governance and output envelope that every **Security Extension** satisfies while its company-specific inputs, rules, connectors, and configuration remain open.

**Finding Envelope**:
The detailed structured JSON result emitted by a **Security Extension** when it detects a concern. It has a stable KVCH header and open extension-specific detail so KVCH can monitor, display, audit, notify, and generate later reports consistently.

**Extension Evaluation Gate**:
The isolated pre-deployment assessment that verifies an artifact can build, run, exit safely, and satisfy the shared runtime/output contract. It does not determine whether an extension's domain-specific detection logic is correct.

**Whitelisting Threshold**:
The management-selected minimum evaluation score an extension must meet before it may be activated for its intended company scope.

**Approved Artifact Hash**:
The SHA-256 hash calculated by KVCH over the exact packaged extension artifact that passed evaluation and whitelisting.

**Extension Installation**:
A registered instance of an approved **Security Extension** running in a specific execution environment, such as VS Code or CI.

**Scheduled Extension Run**:
One KVCH-managed, cron-style invocation of an active **Security Extension** for its configured target and schedule, with recorded start, finish, execution result, and emitted findings.

**Extension Schedule**:
The creator-declared cron schedule in an **Extension Manifest** that determines when KVCH creates a **Scheduled Extension Run** for that immutable artifact.

**Extension Manifest**:
The mandatory, hashed declaration of an extension artifact's runtime, monitored scope, capabilities, and shared protocol version.

**Runtime Heartbeat**:
A signed outbound liveness record from an **Extension Installation** that identifies its artifact hash, declared capabilities, and current time.

**Installation Registration Token**:
A short-lived, single-use KVCH credential that authorizes one Extension Installation to register its public signing key.

**Ingestion Receipt**:
The durable KVCH acknowledgment of one idempotent Runtime Heartbeat or Finding Envelope submission.

**Case Notification**:
An in-dashboard, email, or SMS prompt that directs an authorized recipient to an actionable case without exposing its sensitive projection outside KVCH.

**AI Role Report**:
An AI-generated explanation of an incident that is composed from an authorized **Role Projection** for the current recipient.

**Case Comment**:
An attributed, timestamped human note attached to an incident's audit timeline.

**Company**:
The tenant and authorization boundary that owns Security Extensions, installations, cases, and audit records.

**Administrator**:
The sole fixed KVCH role, held by a Company member who can configure that Company's groups, policies, and delegated authority.

**Company Group**:
A Company-defined collection of members, such as HR or Senior Developer, used to assign scoped KVCH authority and receive escalation routes.

**Group Permission Policy**:
The explicit, scoped list of KVCH actions and evidence access granted to one **Company Group**.

**Group Representative**:
A member authorized by a **Company Group**'s permission policy to manage that group's on-call notification recipient.

**On-Call Recipient**:
The configurable member of a **Company Group** selected to receive its next actionable case notification.

**On-Call Availability**:
The online or offline status a member declares for routing actionable notifications within their **Company Group**.

**Audit Event**:
An append-only, attributable record of a consequential KVCH action or state transition within one **Company**.


## Relationships

- An **Internal Security Control Flow** contains one or more governed actions and may create a **Case** when risk or follow-up requires it.
- A **Junior Developer Scenario** is one application of an **Internal Security Control Flow**.
- A **Security Extension** participates in an **Internal Security Control Flow** without exceeding the invoking user's permissions or applicable policy.
- An **Extension Publisher** may publish **Security Extensions** only within their delegated scope.
- An **Extension Mandate** authorizes an **Extension Publisher** to address a defined cyber-risk problem after a cyberattack without requiring management to assess implementation details.
- An **Approval Ladder** may proceed from a junior developer to senior development, then Human Resources where applicable, and then executive/security leadership.
- An **Employee-Originated Incident** is initially projected only to the immediate next applicable level of the **Approval Ladder**.
- A **Preventive Extension** can block or hold an in-scope action and creates an **Employee-Originated Incident** for notification to the immediate next applicable level.
- A **Security Extension** becomes active when its **Extension Publisher** assigns one or more **Extension Targets** within their delegated scope.
- A senior developer may release a HOLD after review, while a BLOCK requires remediation or a **Break-Glass Release**.
- A **Preventive Extension** evaluates an action before execution; a **Report Extension** evaluates an observed action or state after it occurs.
- A **Security Extension** assigns an **Escalation Route** rather than broadcasting incidents to every listed role.
- Each step of an **Escalation Route** receives a **Role Projection** appropriate to that role.
- An evaluated **Security Extension** receives an **Extension Tracking ID** from the exact artifact hash.
- An **Extension Authoring Assistant** helps an **Extension Publisher** define an extension without receiving authority beyond that publisher's scope.
- Every **Security Extension** satisfies the **Extension Contract** while retaining an open company-specific definition.
- Every **Security Extension** emits a **Finding Envelope**.
- A **Security Extension** must pass the **Extension Evaluation Gate** before publication or activation.
- A **Security Extension** may be activated only when it passes mandatory safety checks and meets its **Whitelisting Threshold**.
- KVCH calculates and verifies an extension's **Approved Artifact Hash** independently of sandbox evaluation; a changed artifact requires a new evaluation and whitelist decision.
- An **Extension Installation** sends **Runtime Heartbeats** to KVCH; KVCH derives its healthy, stale, offline, or hash-mismatched status from them.
- A **Scheduled Extension Run** belongs to one active **Extension Installation** and may emit zero or more **Finding Envelopes**.
- An **Extension Schedule** belongs to the immutable **Extension Manifest** and determines its **Scheduled Extension Runs**.
- Every **Security Extension** includes an **Extension Manifest** in its approved artifact.
- An **Extension Installation** registers a locally generated public signing key using one **Installation Registration Token**.
- An **Extension Installation** receives one **Ingestion Receipt** for each accepted idempotent submission.
- A current **On-Call Recipient** receives a **Case Notification** for their actionable case.
- KVCH accepts a **Finding Envelope** only when it identifies a known **Extension Installation** using its approved artifact hash.
- KVCH generates an **AI Role Report** for the first notified recipient and regenerates it from the next recipient's **Role Projection** upon manual escalation.
- The current recipient may add a **Case Comment** while acknowledging, remediating, closing, or escalating an incident.
- An upstream **Role Projection** includes authorized prior **Case Comments** from the incident timeline.
- A **Company** owns its Security Extensions, Extension Installations, cases, and Audit Events.
- An **Administrator** configures **Company Groups** and delegated authority only within their **Company**.
- A **Group Permission Policy** grants a **Company Group** only its explicitly configured KVCH authority.
- A **Group Representative** selects the **On-Call Recipient** for their **Company Group**.
- A **Company Group** owns a shared inbox while its **On-Call Recipient** receives its actionable notification.
- KVCH routes an actionable notification to the next eligible member in a **Company Group**'s configured hierarchy when the current **On-Call Recipient** is offline.
- A **Company Group** may receive a step in an **Escalation Route**.
- An **Audit Event** belongs to exactly one **Company**.

## Example dialogue

> **Dev:** "Does the **Internal Security Control Flow** apply only when a junior developer merges a pull request?"
> **Domain expert:** "No — a **Junior Developer Scenario** is one entry point; the flow governs all covered internal cyber-risk actions, such as secret exposure, unsafe deployment changes, and privilege requests."

> **Dev:** "Can a **Security Extension** solve a customer-specific risk?"
> **Domain expert:** "Yes, when it declares its inputs, tools, output, and permitted actions and is evaluated by the same control flow."

> **Dev:** "Who can publish a **Security Extension** for junior developers?"
> **Domain expert:** "An **Extension Publisher**, such as a senior developer who has been delegated that authority by management."

> **Dev:** "When does management approve an **Extension Mandate**?"
> **Domain expert:** "After a cyberattack identifies a new control need; routine extensions remain within the **Extension Publisher**'s standing delegated scope."

> **Dev:** "Does every incident go all the way to the CEO?"
> **Domain expert:** "No — the **Approval Ladder** widens only when the event's policy, people impact, business impact, or severity requires it."

> **Dev:** "Why has HR not received an **Employee-Originated Incident** yet?"
> **Domain expert:** "KVCH first notifies the immediate next level. HR receives an authorized projection only if that recipient requests an **Upstream Escalation**."

> **Dev:** "How does an incident reach senior management?"
> **Domain expert:** "An authorized recipient triggers an **Upstream Escalation**, which sends an authorized projection to the next applicable level of the **Approval Ladder**."

> **Dev:** "What happens when a junior developer pushes a secret and the relevant control is active?"
> **Domain expert:** "The **Preventive Extension** blocks the supported action and notifies the immediate senior-development level."

> **Dev:** "Does a junior developer have to enable a security control?"
> **Domain expert:** "No — an **Extension Publisher** assigns **Extension Targets**, and the extension runs automatically for matching actions."

> **Dev:** "Can the notified senior developer unblock a likely secret exposure?"
> **Domain expert:** "They may release a HOLD after review, but a BLOCK requires remediation or an elevated **Break-Glass Release**."

> **Dev:** "Can every KVCH control stop an action before it happens?"
> **Domain expert:** "No — a **Preventive Extension** can act before execution through a supported gateway, while a **Report Extension** responds after observation."

> **Dev:** "If an extension lists senior development, HR, and management, do they all receive the incident at once?"
> **Domain expert:** "No — they form an **Escalation Route**. Senior development is notified first, and later roles receive their **Role Projection** only when the current recipient manually escalates."

> **Dev:** "Why can HR see a different report from the senior developer?"
> **Domain expert:** "Both reports come from the same incident, but each **Role Projection** is authorized and written for the recipient's decisions and expertise."

> **Dev:** "Can KVCH support a control it did not anticipate at product-design time?"
> **Domain expert:** "Yes — the extension supplies company-specific behavior while the shared **Extension Contract** supplies the governance, monitoring, and reporting boundary."

> **Dev:** "How can KVCH display different company extensions in one website?"
> **Domain expert:** "Each extension emits the same **Finding Envelope**, even though the company-specific logic that produced it differs."

> **Dev:** "Can developers implement extensions in different ways?"
> **Domain expert:** "Yes — implementation remains open, but every extension must pass the **Extension Evaluation Gate** and emit the shared **Finding Envelope**."

> **Dev:** "Who decides how strong an extension's evaluation result must be?"
> **Domain expert:** "Higher management sets the **Whitelisting Threshold** when authorizing activation for that company scope."

> **Dev:** "Can a publisher alter an extension after it has been whitelisted?"
> **Domain expert:** "No — KVCH runs only the **Approved Artifact Hash**. Any change becomes a new candidate for evaluation and whitelisting."

> **Dev:** "Does HR receive the technical report that the senior developer saw?"
> **Domain expert:** "No — when the senior developer manually escalates, KVCH generates a new **AI Role Report** from HR's authorized **Role Projection**."

> **Dev:** "Can the senior developer explain why they escalated an incident?"
> **Domain expert:** "Yes — they add a **Case Comment** to the incident's audit timeline before or after escalation."

> **Dev:** "Does HR lose the senior developer's explanation after escalation?"
> **Domain expert:** "No — HR's authorized **Role Projection** includes the relevant prior **Case Comments** alongside its new **AI Role Report**."

## Flagged ambiguities

- "Internal flow" initially referred to a pull-request example; resolved: it means the broader **Internal Security Control Flow**.
- "Stop any cyber attack" is an aspirational outcome, not a deterministic product capability; resolved: KVCH governs covered internal actions and routes detected risks for containment and response.
- "Composability" is delivered through **Security Extensions**, not unrestricted user automation.
- "User-created extension" was ambiguous; resolved: **Security Extensions** are created by delegated **Extension Publishers** and remain company-governed assets.
- Routine extensions use standing publisher delegation; management authorizes an **Extension Mandate** only for incident-driven extensions, while KVCH enforces the technical capabilities declared by the **Extension Publisher**.
- An incident-driven **Security Extension** must receive higher-management approval before activation.
- "Higher management" is resolved as the executive/security stages of an **Approval Ladder**, not a single universal approver.
- HR and executive/security leadership receive an **Employee-Originated Incident** only through sequential **Upstream Escalation**.
- The immediate next applicable level may initiate an **Upstream Escalation**; escalation carries an authorized projection rather than unrestricted evidence.
- KVCH enforces an action only when an in-scope **Preventive Extension** is active.
- Published extensions run automatically only within their assigned **Extension Targets**.
- Senior developers may release HOLDs but cannot bypass BLOCKs without a **Break-Glass Release**.
- Every **Security Extension** declares whether it is a **Preventive Extension** or a **Report Extension**.
- `TO NOTIFY` is resolved as an ordered **Escalation Route**, not an immediate broadcast list.
- AI may summarize and tailor a **Role Projection**, but a human recipient alone controls escalation decisions.
- An extension artifact is monitored through its **Extension Tracking ID**; changing its code produces a new ID and requires evaluation and whitelisting.
- An **Extension Authoring Assistant** supports company-specific extension design; it does not create an authorization bypass.
- Extension behavior is purposefully open behind a stable **Extension Contract**.
- Every extension result uses a common **Finding Envelope**.
- Extension implementation is open, but publication and activation require the **Extension Evaluation Gate**.
- KVCH, rather than the execution sandbox, calculates the SHA-256 **Approved Artifact Hash** over the deterministic extension package.
- Extension runtimes may execute in distributed environments; each registered **Extension Installation** reports liveness through an outbound signed **Runtime Heartbeat**.
- The **Extension Manifest** defines what an extension monitors and may return without exposing its private implementation.
- An Extension Installation retains its private signing key locally; KVCH verifies its heartbeats and Finding Envelopes with the registered public key and can revoke that installation independently.
- Extension Installations submit versioned HTTPS payloads with idempotency keys, allowing retried submissions to receive their original Ingestion Receipt without duplicate cases or notifications.
- KVCH delivers Case Notifications through the dashboard, email, and SMS; sensitive evidence remains in the authorized dashboard projection.
- Higher management configures the **Whitelisting Threshold** during extension whitelisting; mandatory safety failures cannot be overridden by score.
- The runtime artifact must match the **Approved Artifact Hash** evaluated and whitelisted for that extension version.
- AI reports are generated for the current recipient only and are regenerated from the next role's authorized projection upon manual escalation.
- Recipients may add **Case Comments** to the incident timeline.
- Upstream recipients see authorized prior **Case Comments** in their role-specific view.
- Each company has a logically isolated, append-only Audit Event stream, rather than dynamically created audit tables.
- `Administrator` is the only fixed KVCH role; HR and Senior Developer are Company-defined groups rather than hard-coded roles.
- Company Groups authorize actions through explicit Group Permission Policies rather than through their names.
- A Group Representative can change their group's On-Call Recipient from the dashboard; KVCH audits the change and uses it for subsequent findings.
- On-call notification routing follows member-declared On-Call Availability, falling through the configured group hierarchy without automatic upstream escalation.
