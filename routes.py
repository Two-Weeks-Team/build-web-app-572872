import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai_service import generate_financial_brief, parse_messy_financial_intake
from models import Plan, SessionLocal, Snapshot, to_json_str


router = APIRouter()


class PlanRequest(BaseModel):
    query: str
    preferences: Optional[str] = ""


class InsightsRequest(BaseModel):
    selection: str
    context: Optional[str] = ""


class ScenarioRequest(BaseModel):
    plan_id: int
    scenario: str
    income_monthly: Optional[float] = None
    retirement_age: Optional[int] = None
    home_purchase_years: Optional[int] = None


class SnapshotRequest(BaseModel):
    plan_id: int
    name: str


def _db() -> Session:
    return SessionLocal()


def _calc_allocations(scenario: str, income_monthly: float) -> List[Dict[str, Any]]:
    presets = {
        "conservative": {"essentials": 0.52, "debt_reduction": 0.18, "savings": 0.18, "investing": 0.08, "near_term_goals": 0.04},
        "balanced": {"essentials": 0.50, "debt_reduction": 0.16, "savings": 0.16, "investing": 0.12, "near_term_goals": 0.06},
        "aggressive": {"essentials": 0.46, "debt_reduction": 0.14, "savings": 0.14, "investing": 0.18, "near_term_goals": 0.08},
    }
    p = presets.get(scenario, presets["balanced"])
    return [{"category": k, "percent": round(v * 100, 1), "amount": round(income_monthly * v, 2)} for k, v in p.items()]


def _timeline(home_purchase_years: int, retirement_age: int) -> List[Dict[str, Any]]:
    year = datetime.utcnow().year
    return [
        {"milestone": "Emergency fund reaches 6 months", "target_year": year + 1, "depends_on": "Monthly savings consistency"},
        {"milestone": "High-interest debt payoff", "target_year": year + 2, "depends_on": "Debt allocation band"},
        {"milestone": "Home purchase readiness", "target_year": year + home_purchase_years, "depends_on": "Down payment and credit profile"},
        {"milestone": "Retirement readiness checkpoint", "target_year": year + max(5, retirement_age - 35), "depends_on": "Investment contribution rate"},
    ]


@router.post("/plan")
@router.post("/plan")
async def create_plan(payload: PlanRequest):
    db = _db()
    try:
        parsed = await parse_messy_financial_intake(payload.query, payload.preferences or "")
        extracted = parsed.get("data") or {}

        goals = extracted.get("goals") or ["Build emergency fund", "Reduce debt", "Long-term retirement savings"]
        income_monthly = float(extracted.get("income_estimate_monthly") or 7200)
        assumptions = extracted.get("assumption_annotations") or [
            {"assumption": "Monthly income", "rationale": "Inferred from career stage and goals"},
            {"assumption": "Risk posture", "rationale": "Defaulted to balanced when unspecified"},
        ]
        confidence_notes = extracted.get("confidence_notes") or [
            "Income and debt values inferred from natural language and may need adjustment.",
            "Timeline confidence increases after confirming savings and debt APR details.",
        ]

        scenario = "balanced"
        allocations = _calc_allocations(scenario, income_monthly)
        timeline = _timeline(3, 65)

        brief_result = await generate_financial_brief(payload.query, scenario, assumptions)
        brief_data = brief_result.get("data") or {}

        summary = brief_data.get("summary") or "A balanced plan prioritizing debt reduction, home readiness, and retirement consistency."
        items = brief_data.get("priorities") or goals
        score = 82.0 if parsed.get("ok") else 68.0

        plan = Plan(
            title=brief_data.get("brief_title") or "FinFlow Financial Brief",
            query_text=payload.query,
            preferences_json=to_json_str({"preferences": payload.preferences or ""}, {}),
            scenario=scenario,
            summary=summary,
            items_json=to_json_str(items, []),
            score=score,
            assumptions_json=to_json_str(assumptions, []),
            confidence_notes_json=to_json_str(confidence_notes, []),
            caveats_json=to_json_str(brief_data.get("planning_caveats") or ["Not investment, tax, or legal advice."], []),
            timeline_json=to_json_str(timeline, []),
            allocation_bands_json=to_json_str(allocations, []),
            next_steps_json=to_json_str(brief_data.get("next_step_callouts") or [], []),
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        return {
            "plan_id": plan.id,
            "summary": summary,
            "items": items,
            "score": score,
            "financial_brief": {
                "title": plan.title,
                "goals": goals,
                "assumptions": assumptions,
                "constraints": extracted.get("constraints") or [],
                "confidence_notes": confidence_notes,
                "caveats": json.loads(plan.caveats_json),
                "next_steps": json.loads(plan.next_steps_json),
            },
            "goal_timeline": timeline,
            "cash_flow_plan": allocations,
            "assumption_annotations": assumptions,
            "note": parsed.get("note", "")
        }
    finally:
        db.close()


@router.post("/insights")
@router.post("/insights")
async def create_insights(payload: InsightsRequest):
    msg = payload.selection.lower()
    insights = [
        "Debt APR above 7% should be prioritized before increasing discretionary spending.",
        "Maintain at least a 3-month emergency fund before accelerating house down-payment contributions.",
        "Revisit allocation quarterly to keep goals on timeline."
    ]
    if "retirement" in msg:
        insights.insert(0, "Increasing retirement contribution by 2% could close projected readiness gap by ~3 years.")

    next_actions = [
        "Set automatic transfer on payday for emergency fund bucket.",
        "Refinance or consolidate highest-interest debt.",
        "Create separate sinking fund for home closing costs."
    ]
    highlights = [
        "Assumption sensitivity: income volatility has the largest timeline impact.",
        "Balanced scenario currently offers best tradeoff between debt payoff and long-term growth.",
        "Confidence note: debt principal inferred from text; confirm exact balances."
    ]

    return {"insights": insights, "next_actions": next_actions, "highlights": highlights}


@router.post("/scenario")
@router.post("/scenario")
def recalculate_scenario(payload: ScenarioRequest):
    db = _db()
    try:
        plan = db.get(Plan, payload.plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        scenario = payload.scenario.lower().strip()
        if scenario not in {"conservative", "balanced", "aggressive"}:
            scenario = "balanced"

        assumptions = json.loads(plan.assumptions_json)
        income_monthly = float(payload.income_monthly or 7200)
        retirement_age = int(payload.retirement_age or 65)
        home_purchase_years = int(payload.home_purchase_years or 3)

        assumptions.append({"assumption": "Updated income", "rationale": f"Set to {income_monthly} for scenario recompute"})

        allocations = _calc_allocations(scenario, income_monthly)
        timeline = _timeline(home_purchase_years, retirement_age)

        plan.scenario = scenario
        plan.allocation_bands_json = to_json_str(allocations, [])
        plan.timeline_json = to_json_str(timeline, [])
        plan.assumptions_json = to_json_str(assumptions, [])
        db.commit()

        return {
            "plan_id": plan.id,
            "scenario": scenario,
            "goal_timeline": timeline,
            "allocation_bands": allocations,
            "recommended_actions": [
                "Re-check contribution automation this week.",
                "Align debt payoff target with new cash flow band.",
                "Review insurance and emergency coverage before increasing risk."
            ]
        }
    finally:
        db.close()


@router.post("/snapshots")
@router.post("/snapshots")
def create_snapshot(payload: SnapshotRequest):
    db = _db()
    try:
        plan = db.get(Plan, payload.plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        preview = f"{plan.title}\nScenario: {plan.scenario}\nSummary: {plan.summary}"
        snap = Snapshot(
            plan_id=plan.id,
            name=payload.name,
            brief_preview=preview,
            scenario=plan.scenario,
            assumptions_json=plan.assumptions_json,
            timeline_json=plan.timeline_json,
            allocation_bands_json=plan.allocation_bands_json,
        )
        db.add(snap)
        db.commit()
        db.refresh(snap)
        return {"snapshot_id": snap.id, "name": snap.name, "brief_preview": snap.brief_preview}
    finally:
        db.close()


@router.get("/snapshots")
@router.get("/snapshots")
def list_snapshots():
    db = _db()
    try:
        rows = db.query(Snapshot).order_by(Snapshot.created_at.desc()).limit(20).all()
        return {
            "items": [
                {
                    "snapshot_id": s.id,
                    "plan_id": s.plan_id,
                    "name": s.name,
                    "scenario": s.scenario,
                    "brief_preview": s.brief_preview,
                    "created_at": s.created_at.isoformat(),
                }
                for s in rows
            ]
        }
    finally:
        db.close()
