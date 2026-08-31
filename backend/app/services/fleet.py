from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import logging
from ..db.models import Bus, EdgeDevice, RoadSegment, User, Event, ANPRRecord, VehicleCountSnapshot
from ..core.security import get_password_hash
from .realtime import manager

logger = logging.getLogger("UrbanEye.Fleet")

# Default Delhi / Smart City Transit Corridor coordinates
DEFAULT_BUSES = [
    {"bus_id": "BUS-101", "reg": "DL-1PC-4821", "route": "Route 419: Connaught Place <-> Nehru Place", "lat": 28.6289, "lng": 77.2065, "speed": 34.2, "heading": 142.0},
    {"bus_id": "BUS-102", "reg": "DL-1PC-5912", "route": "Route 522: AIIMS <-> Kashmere Gate ISBT", "lat": 28.5672, "lng": 77.2100, "speed": 28.5, "heading": 355.0},
    {"bus_id": "BUS-204", "reg": "DL-1PD-1092", "route": "Route 764: IGI Airport T3 <-> Karol Bagh", "lat": 28.5562, "lng": 77.1000, "speed": 48.0, "heading": 45.0},
    {"bus_id": "BUS-305", "reg": "DL-1PD-8834", "route": "Route 181: Lajpat Nagar <-> Rohini Sec-18", "lat": 28.5700, "lng": 77.2400, "speed": 22.0, "heading": 210.0},
    {"bus_id": "BUS-408", "reg": "DL-1PC-3310", "route": "Route 970: Anand Vihar <-> Uttam Nagar", "lat": 28.6500, "lng": 77.3150, "speed": 39.5, "heading": 270.0},
]

DEFAULT_SEGMENTS = [
    {"id": "SEG-CP-01", "name": "Barakhamba Road - Connaught Place", "start_lat": 28.6304, "start_lng": 77.2177, "end_lat": 28.6260, "end_lng": 77.2270, "score": 88.0, "potholes": 1, "waterlog": 0},
    {"id": "SEG-RING-02", "name": "Mahatma Gandhi Ring Road (Moolchand Stretch)", "start_lat": 28.5680, "start_lng": 77.2340, "end_lat": 28.5610, "end_lng": 77.2450, "score": 42.0, "potholes": 7, "waterlog": 2, "priority": "URGENT"},
    {"id": "SEG-AIRPORT-03", "name": "Airport Expressway (Mahipalpur Underpass)", "start_lat": 28.5420, "start_lng": 77.1200, "end_lat": 28.5350, "end_lng": 77.1100, "score": 64.0, "potholes": 3, "waterlog": 1, "priority": "WATCHLIST"},
    {"id": "SEG-ISBT-04", "name": "Yudhistir Setu - Kashmere Gate", "start_lat": 28.6670, "start_lng": 77.2290, "end_lat": 28.6720, "end_lng": 77.2350, "score": 94.0, "potholes": 0, "waterlog": 0, "priority": "NORMAL"},
    {"id": "SEG-OUTER-05", "name": "Outer Ring Road (Nehru Place Flyover)", "start_lat": 28.5490, "start_lng": 77.2520, "end_lat": 28.5420, "end_lng": 77.2610, "score": 79.0, "potholes": 2, "waterlog": 0, "priority": "NORMAL"}
]

async def seed_initial_data(db: AsyncSession):
    # Seed Users
    users_res = await db.execute(select(User))
    if not users_res.scalars().first():
        logger.info("Seeding default RBAC users...")
        users = [
            User(username="admin", email="admin@bel.urbaneye.gov.in", hashed_password=get_password_hash("admin123"), full_name="BEL Chief Administrator", role="admin"),
            User(username="analyst", email="analyst@bel.urbaneye.gov.in", hashed_password=get_password_hash("analyst123"), full_name="City Transport Analyst", role="analyst"),
            User(username="viewer", email="viewer@bel.urbaneye.gov.in", hashed_password=get_password_hash("viewer123"), full_name="Operations Viewer", role="viewer"),
            User(username="traffic_police", email="traffic_liaison@delhipolice.gov.in", hashed_password=get_password_hash("police123"), full_name="Traffic Enforcement Liaison", role="law_enforcement_liaison"),
        ]
        db.add_all(users)
        await db.commit()

    # Seed Buses & Edge Devices
    buses_res = await db.execute(select(Bus))
    if not buses_res.scalars().first():
        logger.info("Seeding default bus fleet and edge hardware profiles...")
        for b_data in DEFAULT_BUSES:
            bus = Bus(
                bus_id=b_data["bus_id"],
                registration_no=b_data["reg"],
                route_name=b_data["route"],
                status="ACTIVE",
                current_lat=b_data["lat"],
                current_lng=b_data["lng"],
                speed_kmh=b_data["speed"],
                heading_deg=b_data["heading"],
                last_seen=datetime.utcnow()
            )
            db.add(bus)
            
            edge_dev = EdgeDevice(
                device_id=f"EDGE-{b_data['bus_id'].split('-')[1]}",
                bus_id=b_data["bus_id"],
                model_family="NVIDIA Jetson Orin Nano 8GB",
                firmware_version="v2.4.1-bel",
                model_version="yolov8n-urbaneye-v3.2",
                status="ONLINE",
                cpu_usage_pct=28.4,
                gpu_usage_pct=64.2,
                temperature_c=51.8,
                storage_free_gb=46.2,
                buffered_events_count=0,
                last_heartbeat=datetime.utcnow()
            )
            db.add(edge_dev)
        await db.commit()

    # Seed Road Segments
    segments_res = await db.execute(select(RoadSegment))
    if not segments_res.scalars().first():
        logger.info("Seeding municipal road network segments...")
        for s in DEFAULT_SEGMENTS:
            seg = RoadSegment(
                segment_id=s["id"],
                road_name=s["name"],
                start_lat=s["start_lat"],
                start_lng=s["start_lng"],
                end_lat=s["end_lat"],
                end_lng=s["end_lng"],
                pothole_count=s["potholes"],
                waterlogging_count=s["waterlog"],
                condition_score=s["score"],
                maintenance_priority=s.get("priority", "NORMAL"),
                last_inspected=datetime.utcnow()
            )
            db.add(seg)
        await db.commit()

async def update_bus_telemetry(bus_id: str, lat: float, lng: float, speed: float, heading: float, db: AsyncSession):
    bus = await db.get(Bus, bus_id)
    if bus:
        bus.current_lat = lat
        bus.current_lng = lng
        bus.speed_kmh = speed
        bus.heading_deg = heading
        bus.last_seen = datetime.utcnow()
        await db.commit()
        
        # Broadcast bus movement
        await manager.broadcast({
            "channel": "telemetry",
            "action": "bus_update",
            "data": {
                "bus_id": bus.bus_id,
                "lat": bus.current_lat,
                "lng": bus.current_lng,
                "speed_kmh": bus.speed_kmh,
                "heading_deg": bus.heading_deg,
                "status": bus.status,
                "route_name": bus.route_name
            }
        })
