export type DemoReport = {
  mistakes: string[];
  skill_gaps: string[];
  learn_next: string[];
  project_ideas: string[];
};

export function normalizeDemoReport(raw: unknown): DemoReport {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const arr = (k: string) =>
    Array.isArray(o[k]) ? (o[k] as unknown[]).map((x) => String(x).trim()).filter(Boolean) : [];
  return {
    mistakes: arr("mistakes"),
    skill_gaps: arr("skill_gaps"),
    learn_next: arr("learn_next"),
    project_ideas: arr("project_ideas"),
  };
}
