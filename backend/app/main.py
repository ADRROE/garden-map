from fastapi import FastAPI
from app.api import items, zones
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import logging

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(items.router, prefix="/api/items", tags=["Elements"])
app.include_router(zones.router, prefix="/api/zones", tags=["Zones"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,  # Needed if frontend uses cookies or auth
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_headers(request, call_next):
    response = await call_next(request)
    print("Response Headers:", response.headers)
    return response

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)
logger.debug("🚀 Backend has started...")
