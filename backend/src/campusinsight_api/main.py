from fastapi import FastAPI

app = FastAPI(
    title="CampusInsight API",
    description="Backend foundation for the CampusInsight student analytics dashboard.",
    version="0.1.0",
)


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
