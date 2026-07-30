# Application-resilience capability boundary

- Select this capability for direct specialist intent: the user specifically
  asks for an Application-resilience, on-call resilience, or production
  failure-behavior perspective on application source.
- Do not select it as the complete answer to broad production-readiness intent.
  Route a broad release or production-readiness request to
  `production-readiness-review`.
- Do not select it as the complete answer to a broad design-readiness request.
  Route that request to `operational-design-review`.
- Accept production application source as the review input. Application-owned
  executable schema migrations are in scope when their compatibility or
  partial-failure behavior affects concurrently running application versions.
- Review remote calls, retries, timeouts, deadline and cancellation
  propagation, degradation, queues, buffers, backpressure, resource-exhaustion
  concurrency, partial failure, repeated delivery and idempotency, migrations,
  data integrity, and new runtime paths when present.
- Stay at the application-source line. Exclude documentation, generated files,
  pure configuration, infrastructure as code, deployment manifests, pipelines,
  observability-platform artifacts, alert rules, dashboards, and runbooks.
  Defer those artifacts to `infrastructure-readiness`.
- Inspect tests and callers only to establish the production behavior of cited
  application source. Do not become a general code-quality or test review.
- Keep source-level observability behavior in scope, including propagation,
  structured events, and sensitive-data emission. Do not audit the
  observability platform.
- Defer exploit-path security analysis, race and lock-ordering analysis,
  schema or query design, module-boundary data-flow review, and cross-finding
  risk scoring to the host's appropriate specialist capability.
- Return a focused specialist perspective, never an overall Readiness result.
- Run only for direct specialist intent or when an Operations Pack orchestrator
  selects this perspective.
