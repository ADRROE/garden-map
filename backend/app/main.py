from fastapi import FastAPI
from app.api import elements
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(elements.router, prefix="/api/elements", tags=["Elements"])

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
