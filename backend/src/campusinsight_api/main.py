from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from campusinsight_api.api.academic_records import router as academic_records_router
from campusinsight_api.api.analyses import router as analyses_router

app = FastAPI(
    title="CampusInsight API",
    description="Backend foundation for the CampusInsight student analytics dashboard.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(academic_records_router)
app.include_router(analyses_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "service": "campusinsight-api",
        "message": "CampusInsight API foundation is running.",
        "status": "under-development",
    }


@app.get("/health")
def read_health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "campusinsight-api",
    }
