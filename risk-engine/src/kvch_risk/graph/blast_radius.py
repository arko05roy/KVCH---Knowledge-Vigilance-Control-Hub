from typing import Dict, Any
from kvch_risk.schemas.models import AssetServiceProfile


def evaluate_asset_graph(asset: AssetServiceProfile) -> Dict[str, Any]:
    """
    Evaluates business service dependency graph and blast radius multipliers.
    """
    criticality_tier = "CRITICAL" if asset.downtime_cost_per_hour_inr >= 1000000.0 else "HIGH"
    
    # Blast radius user impact multiplier
    user_factor = 1.0 + min(2.0, asset.active_users / 100000.0)
    effective_downtime_rate = asset.downtime_cost_per_hour_inr * user_factor

    return {
        "asset_id": asset.asset_id,
        "business_service_id": asset.business_service_id,
        "criticality_tier": criticality_tier,
        "user_factor": round(user_factor, 2),
        "effective_downtime_rate_inr": round(effective_downtime_rate, 2),
        "dependent_nodes": [
            f"Merchant Checkout Gateway ({asset.active_users} active users)",
            "Core Ledger Settlement Service",
            "Customer Mobile Wallet API Gateway"
        ]
    }
