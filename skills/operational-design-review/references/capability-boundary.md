# Operational-design-review capability boundary

- Accept a candidate design as the review input.
- Run at the Design seam before specification finalization.
- Route a focused Infrastructure-readiness request directly to
  `infrastructure-readiness`.
- Route a focused Application-resilience request directly to
  `application-resilience`.
- For focused specialist intent, do not add the other perspective or emit an
  overall Readiness result.
- Select applicable specialist perspectives and preserve their independence.
- Return the complete Design-seam Readiness result.
- Do not embed fallback copies of specialist behavior.
