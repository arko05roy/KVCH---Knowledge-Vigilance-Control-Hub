if (process.env.KVCH_EVALUATION !== "1") {
  for (const index of [1, 2]) {
    process.stdout.write(JSON.stringify({
      schema_version: "kvch.finding/v1",
      observed_at: "2026-09-04T14:00:00Z",
      severity: "high",
      category: "fixture_threshold",
      title: `Synthetic threshold concern ${index}`,
      summary: "Embedded fixture observation exceeds its baseline.",
      resource: { type: "fixture", id: "node", name: "Offline Node fixture" },
      evidence: [],
      indicators: [],
      baseline: { threshold: 10 },
      recommended_actions: [],
      details: { observed: index + 10, threshold: 10, synthetic: true },
    }) + "\n");
  }
}
