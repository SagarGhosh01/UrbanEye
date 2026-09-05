from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from ...db.database import get_db
from ...db.models import State, District

router = APIRouter()

@router.get("")
async def list_districts(
    state_id: Optional[str] = Query(None, description="Filter districts by state ID (e.g. RJ, DL, MH)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns state and district master data for cascading dropdown filters in the dashboard.
    """
    states_query = select(State)
    if state_id:
        states_query = states_query.where(State.state_id == state_id)

    states_res = await db.execute(states_query)
    states = states_res.scalars().all()

    districts_query = select(District)
    if state_id:
        districts_query = districts_query.where(District.state_id == state_id)
    
    districts_res = await db.execute(districts_query)
    districts = districts_res.scalars().all()

    state_list = []
    for s in states:
        d_items = [
            {
                "district_id": d.district_id,
                "district_name": d.district_name,
                "district_code": d.district_code,
                "center_lat": d.center_lat,
                "center_lng": d.center_lng
            }
            for d in districts if d.state_id == s.state_id
        ]
        state_list.append({
            "state_id": s.state_id,
            "state_code": s.state_code,
            "state_name": s.state_name,
            "districts": d_items
        })

    # Hardcoded fallback list if database is seeding
    if len(state_list) == 0:
        return [
            {
                "state_id": "RJ",
                "state_code": "RJ",
                "state_name": "Rajasthan",
                "districts": [
                    {"district_id": "RJ-14", "district_name": "Jaipur", "district_code": "14", "center_lat": 26.9124, "center_lng": 75.7873},
                    {"district_id": "RJ-19", "district_name": "Jodhpur", "district_code": "19", "center_lat": 26.2389, "center_lng": 73.0243}
                ]
            },
            {
                "state_id": "DL",
                "state_code": "DL",
                "state_name": "Delhi NCR",
                "districts": [
                    {"district_id": "DL-01", "district_name": "Central Delhi", "district_code": "01", "center_lat": 28.6139, "center_lng": 77.2090}
                ]
            },
            {
                "state_id": "MH",
                "state_code": "MH",
                "state_name": "Maharashtra",
                "districts": [
                    {"district_id": "MH-01", "district_name": "Mumbai City", "district_code": "01", "center_lat": 18.9690, "center_lng": 72.8210}
                ]
            },
            {
                "state_id": "WB",
                "state_code": "WB",
                "state_name": "West Bengal",
                "districts": [
                    {"district_id": "WB-01", "district_name": "Kolkata", "district_code": "01", "center_lat": 22.5726, "center_lng": 88.3639}
                ]
            }
        ]

    return state_list
