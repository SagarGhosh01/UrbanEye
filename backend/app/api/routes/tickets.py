from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from ...services.consensus_and_ticketing import ticket_service, consensus_engine, emissions_service, MunicipalTicket

router = APIRouter()

class TicketCreateRequest(BaseModel):
    event_id: str
    hazard_type: str
    severity: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    buses: List[str] = ["BUS-101"]
    road_name: Optional[str] = "Ring Road Transit Corridor"

@router.get("/", response_model=List[MunicipalTicket])
async def get_all_tickets():
    """
    List all automated Municipal Work-Order Maintenance Tickets.
    """
    return ticket_service.list_tickets()

@router.post("/generate", response_model=MunicipalTicket)
async def generate_ticket_from_event(req: TicketCreateRequest):
    """
    Auto-generates a certified PWD work order ticket with material volume, cost estimate in INR, and SHA-256 seal.
    """
    ticket = ticket_service.create_ticket(
        event_id=req.event_id,
        hazard_type=req.hazard_type,
        severity=req.severity,
        lat=req.lat,
        lng=req.lng,
        buses=req.buses,
        road_name=req.road_name or "Ring Road Transit Corridor"
    )
    return ticket

@router.get("/emissions-report")
async def get_emissions_report(total_vehicles: int = 450, total_potholes: int = 8):
    """
    Calculates fleet-wide carbon footprint impact and avoidable fuel burn due to road defects.
    """
    return emissions_service.calculate_fleet_emissions(total_vehicles, total_potholes)
