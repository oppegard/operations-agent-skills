# Infrastructure-readiness capability boundary

- Select this capability for direct specialist intent: the user specifically
  asks for an Infrastructure-readiness, DevOps, SRE, infrastructure, delivery,
  or rollout-control perspective.
- Do not select it as the complete answer to broad production-readiness intent.
  Route a broad release or production-readiness request to
  `production-readiness-review`.
- Do not select it as the complete answer to a broad design-readiness request.
  Route that request to `operational-design-review`.
- Accept operational and rollout-affecting artifacts as review input.
- Cover infrastructure, delivery, infrastructure as code, observability
  configuration, operational controls, scale, cost, and production fitness.
  This includes containers, hosting, deployment manifests, CI/CD, progressive
  delivery, feature flags, secrets delivery, compliance controls, supply
  chain, capacity, incident response, and production operations.
- Inspect application source only where it proves how the system runs or
  interacts with an operational artifact. Defer application-source resilience
  concerns such as timeout, retry, buffering, concurrency, and repeated
  delivery behavior to `application-resilience`.
- Keep operational security posture in scope, including secrets delivery,
  workload identity, artifact provenance, and PII handling. Defer exploit-path
  security analysis to the host's security review capability.
- Return a focused specialist perspective, never an overall Readiness result.
- Run only for direct specialist intent or when an Operations Pack orchestrator
  selects this perspective.
