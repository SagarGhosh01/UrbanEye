from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ...db.database import get_db
from ...schemas.analytics import FleetKPISummary, HeatmapPoint, RoadSegmentResponse, BandwidthReport
from ...services.analytics import get_kpi_summary, get_heatmap_points, get_road_segments, get_bandwidth_report

router = APIRouter()

@router.get("/kpis", response_model=FleetKPISummary)
async def get_kpis(db: AsyncSession = Depends(get_db)):
    return await get_kpi_summary(db)

@router.get("/heatmaps", response_model=List[HeatmapPoint])
async def get_heatmaps(db: AsyncSession = Depends(get_db)):
    return await get_heatmap_points(db)

@router.get("/road-segments", response_model=List[RoadSegmentResponse])
async def list_road_segments(db: AsyncSession = Depends(get_db)):
    return await get_road_segments(db)

@router.get("/bandwidth", response_model=BandwidthReport)
async def get_bandwidth(db: AsyncSession = Depends(get_db)):
    return await get_bandwidth_report(db)
