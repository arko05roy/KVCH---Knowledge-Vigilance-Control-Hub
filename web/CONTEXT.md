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
The immutable identifier assigned to a published version of a **Security Extension** for monitoring, audit, and case linkage.

**Extension Authoring Assistant**:
An AI skill and tool interface that helps an **Extension Publisher** compose a valid **Security Extension** within their delegated scope.

**Extension Contract**:
The small stable governance and output envelope that every **Security Extension** satisfies while its company-specific inputs, rules, connectors, and configuration remain open.

**Finding Envelope**:
The normalized result emitted by a **Security Extension** so KVCH can monitor, display, audit, notify, and report on the result consistently.

**Extension Evaluation Gate**:
The isolated pre-publication assessment that validates a **Security Extension** against its declared scope, safety constraints, test scenarios, and shared output contract.

**Whitelisting Threshold**:
The management-selected minimum evaluation score an extension must meet before it may be activated for its intended company scope.

**Approved Artifact Hash**:
The immutable content hash of the exact extension artifact that passed evaluation and whitelisting, which KVCH verifies before activation and execution.

**AI Role Report**:
An AI-generated explanation of an incident that is composed from an authorized **Role Projection** for the current recipient.

**Case Comment**:
An attributed, timestamped human note attached to an incident's audit timeline.


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
- A published **Security Extension** receives an **Extension Tracking ID**.
- An **Extension Authoring Assistant** helps an **Extension Publisher** define an extension without receiving authority beyond that publisher's scope.
- Every **Security Extension** satisfies the **Extension Contract** while retaining an open company-specific definition.
- Every **Security Extension** emits a **Finding Envelope**.
- A **Security Extension** must pass the **Extension Evaluation Gate** before publication or activation.
- A **Security Extension** may be activated only when it passes mandatory safety checks and meets its **Whitelisting Threshold**.
- KVCH verifies an extension against its **Approved Artifact Hash**; a changed artifact requires a new evaluation and whitelist decision.
- KVCH generates an **AI Role Report** for the first notified recipient and regenerates it from the next recipient's **Role Projection** upon manual escalation.
- The current recipient may add a **Case Comment** while acknowledging, remediating, closing, or escalating an incident.
- An upstream **Role Projection** includes authorized prior **Case Comments** from the incident timeline.

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
- A published extension is monitored through its **Extension Tracking ID**.
- An **Extension Authoring Assistant** supports company-specific extension design; it does not create an authorization bypass.
- Extension behavior is purposefully open behind a stable **Extension Contract**.
- Every extension result uses a common **Finding Envelope**.
- Extension implementation is open, but publication and activation require the **Extension Evaluation Gate**.
- Higher management configures the **Whitelisting Threshold** during extension whitelisting; mandatory safety failures cannot be overridden by score.
- The runtime artifact must match the **Approved Artifact Hash** evaluated and whitelisted for that extension version.
- AI reports are generated for the current recipient only and are regenerated from the next role's authorized projection upon manual escalation.
- Recipients may add **Case Comments** to the incident timeline.
- Upstream recipients see authorized prior **Case Comments** in their role-specific view.
