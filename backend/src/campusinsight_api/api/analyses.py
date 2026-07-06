from collections.abc import Callable
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse

from campusinsight_api.services.saved_analysis_repository import (
    SavedAnalysisRepository,
    saved_analysis_summaries_to_dicts,
)

router = APIRouter(prefix="/analyses", tags=["analyses"])


def get_saved_analysis_repository() -> SavedAnalysisRepository:
    return SavedAnalysisRepository()


@router.get("", response_model=None)
def list_saved_analyses(
    repository: Annotated[SavedAnalysisRepository, Depends(get_saved_analysis_repository)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> JSONResponse:
    return _safe_repository_response(
        lambda: {
            "analyses": saved_analysis_summaries_to_dicts(repository.list(limit=limit)),
            "limit": limit,
        }
    )


@router.get("/{analysis_id}", response_model=None)
def get_saved_analysis(
    analysis_id: str,
    repository: Annotated[SavedAnalysisRepository, Depends(get_saved_analysis_repository)],
) -> JSONResponse:
    def load_analysis() -> dict[str, Any] | JSONResponse:
        saved_analysis = repository.get(analysis_id)
        if saved_analysis is None:
            return _not_found(analysis_id)
        return saved_analysis.analysis

    return _safe_repository_response(load_analysis)


@router.delete("/{analysis_id}", response_model=None)
def delete_saved_analysis(
    analysis_id: str,
    repository: Annotated[SavedAnalysisRepository, Depends(get_saved_analysis_repository)],
) -> JSONResponse:
    def delete_analysis() -> dict[str, Any] | JSONResponse:
        if not repository.delete(analysis_id):
            return _not_found(analysis_id)
        return {"deleted": True, "analysis_id": analysis_id}

    return _safe_repository_response(delete_analysis)


def _safe_repository_response(handler: Callable[[], dict[str, Any] | JSONResponse]) -> JSONResponse:
    try:
        response = handler()
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"detail": "Saved analyses are currently unavailable."},
        )

    if isinstance(response, JSONResponse):
        return response
    return JSONResponse(content=jsonable_encoder(response))


def _not_found(analysis_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Saved analysis was not found.",
            "analysis_id": analysis_id,
        },
    )
