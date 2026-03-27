export type ScenarioType = "conservative" | "balanced" | "aggressive";

export type PlanResponse = {
  summary: string;
  items: string[];
  score: number;
  goals?: string[];
  assumptions?: string[];
  constraints?: string[];
  confidence_notes?: string[];
  timeline?: { label: string; target: string; note: string }[];
  allocation?: { bucket: string; percentage: number; amount: number }[];
  next_actions?: { title: string; impact: string; effort: string }[];
};

export type Snapshot = {
  id: number;
  name: string;
  summary: string;
  scenario: ScenarioType;
  score: number;
  created_at: string;
};

const handle = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json() as Promise<T>;
};

export async function fetchDemoPlan(): Promise<PlanResponse> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "Maya Chen, 34, wants to buy a home in 3 years while paying off student loans. She earns about $8,700 monthly before tax, has $24k in savings and $62k student debt.",
      preferences: "balanced risk, emergency fund first, retirement age 62"
    })
  });
  return handle<PlanResponse>(res);
}

export async function parsePlan(payload: { query: string; preferences: string }): Promise<PlanResponse> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handle<PlanResponse>(res);
}

export async function fetchInsights(payload: { selection: string; context: string }): Promise<PlanResponse> {
  const res = await fetch("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handle<PlanResponse>(res);
}

export async function recalculateScenario(payload: { selection: ScenarioType; context: string }): Promise<PlanResponse> {
  return fetchInsights(payload);
}

export async function fetchSnapshots(): Promise<Snapshot[]> {
  const res = await fetch("/api/snapshots", { cache: "no-store" });
  return handle<Snapshot[]>(res);
}

export async function saveSnapshot(payload: { name: string; summary: string; scenario: ScenarioType; score: number }): Promise<Snapshot> {
  const res = await fetch("/api/snapshots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handle<Snapshot>(res);
}
