import json

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse

from models import Base, Plan, SessionLocal, Snapshot, engine, to_json_str
from routes import router


app = FastAPI(title="FinFlow AI API", version="1.0.0")

@app.middleware("http")
async def normalize_api_prefix(request: Request, call_next):
    if request.scope.get("path", "").startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:] or "/"
    return await call_next(request)

app.include_router(router)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Plan).count()
        if existing == 0:
            seeds = [
                {
                    "title": "Maya Chen Home + Debt Plan",
                    "query": "Maya Chen, 34, wants to buy a home in 3 years while paying off student loans.",
                    "summary": "Balanced plan for down payment growth while reducing student debt.",
                    "scenario": "balanced",
                    "score": 84.0,
                },
                {
                    "title": "Balanced Family Wealth Plan",
                    "query": "Jordan Alvarez, 41, balancing retirement catch-up contributions with two children's education goals.",
                    "summary": "Coordinated savings plan for retirement and education with staged milestones.",
                    "scenario": "conservative",
                    "score": 79.0,
                },
            ]
            for s in seeds:
                p = Plan(
                    title=s["title"],
                    query_text=s["query"],
                    preferences_json=to_json_str({"preferences": "seed"}, {}),
                    scenario=s["scenario"],
                    summary=s["summary"],
                    items_json=to_json_str(["Emergency fund", "Debt payoff", "Retirement contributions"], []),
                    score=s["score"],
                    assumptions_json=to_json_str([
                        {"assumption": "Income stability", "rationale": "Seeded planning baseline"}
                    ], []),
                    confidence_notes_json=to_json_str([
                        "Seed demo plan. Replace with user-provided assumptions for accuracy."
                    ], []),
                    caveats_json=to_json_str(["Educational planning output, not regulated advice."], []),
                    timeline_json=to_json_str([
                        {"milestone": "Emergency fund", "target_year": 2027, "depends_on": "Automated transfers"}
                    ], []),
                    allocation_bands_json=to_json_str([
                        {"category": "essentials", "percent": 50, "amount": 3500}
                    ], []),
                    next_steps_json=to_json_str([
                        {"title": "Automate savings", "impact": "high", "effort": "low", "blocker": "cash-flow variability"}
                    ], []),
                )
                db.add(p)
            db.commit()

            first_plan = db.query(Plan).first()
            if first_plan:
                snap = Snapshot(
                    plan_id=first_plan.id,
                    name="Conservative Home Purchase Plan",
                    brief_preview=f"{first_plan.title}\nScenario: {first_plan.scenario}\nSummary: {first_plan.summary}",
                    scenario=first_plan.scenario,
                    assumptions_json=first_plan.assumptions_json,
                    timeline_json=first_plan.timeline_json,
                    allocation_bands_json=first_plan.allocation_bands_json,
                )
                db.add(snap)
                db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def root():
    endpoints = [
        ("GET", "/health"),
        ("POST", "/plan and /api/plan"),
        ("POST", "/insights and /api/insights"),
        ("POST", "/scenario and /api/scenario"),
        ("POST", "/snapshots and /api/snapshots"),
        ("GET", "/snapshots and /api/snapshots"),
        ("GET", "/docs"),
        ("GET", "/redoc"),
    ]
    rows = "".join([f"<li><b>{m}</b> {p}</li>" for m, p in endpoints])
    return HTMLResponse(
        content=f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>FinFlow AI API</title>
  <style>
    body {{ background:#111827; color:#e5e7eb; font-family:Inter,Arial,sans-serif; margin:0; padding:32px; }}
    .card {{ max-width:900px; margin:auto; background:#1f2937; border:1px solid #374151; border-radius:14px; padding:24px; }}
    h1 {{ color:#f9fafb; margin-top:0; }}
    .muted {{ color:#9ca3af; }}
    a {{ color:#93c5fd; }}
    ul {{ line-height:1.8; }}
    .stack {{ margin-top:20px; padding:12px; background:#111827; border-radius:10px; border:1px solid #374151; }}
  </style>
</head>
<body>
  <div class=\"card\">
    <h1>FinFlow AI API</h1>
    <p class=\"muted\">FinFlow AI turns messy financial goals into a clear, editable money plan you can trust, compare, and save.</p>
    <div class=\"stack\">
      <h3>Endpoints</h3>
      <ul>{rows}</ul>
    </div>
    <div class=\"stack\">
      <h3>Tech Stack</h3>
      <p>FastAPI 0.115.0 · SQLAlchemy 2.0.35 · Pydantic 2.9.0 · httpx 0.27.0 · PostgreSQL-ready models · DO Serverless Inference (anthropic-claude-4.6-sonnet)</p>
      <p><a href=\"/docs\">OpenAPI Docs</a> · <a href=\"/redoc\">ReDoc</a></p>
    </div>
  </div>
</body>
</html>
"""
    )
