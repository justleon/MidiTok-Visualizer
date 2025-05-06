import json

import logging.config
import os

from fastapi import Body, FastAPI, File, HTTPException, UploadFile,Form,Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import traceback
from core.api.logging_middleware import LoggingMiddleware, log_config
from core.api.model import ConfigModel, MusicInformationData
from core.service.midi_processing import MidiProcessor

from core.service.serializer import TokSequenceEncoder

logging.config.dictConfig(log_config)
logger = logging.getLogger(__name__)
procesor=MidiProcessor()
app = FastAPI()

react_api_base_url = os.getenv("REACT_APP_API_BASE_URL", "http://localhost:3000")
origins = []
if react_api_base_url:
    origins.append(react_api_base_url)


app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

app.add_middleware(LoggingMiddleware, logger=logger)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        content={"success": False, "data": None, "error": "Invalid request parameters"}, status_code=422
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unexpected error on {request.url.path}:\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": "Internal server error"
        }
    )

def save_to_file(data, filename):  # debug function
    with open(filename, "w", encoding="utf-8") as f:
        f.write(str(data))


@app.post("/process")
async def process(config: str = Form(...), file: UploadFile = File(...)) -> JSONResponse:
    try:
        if file.content_type not in ["audio/mid", "audio/midi", "audio/x-mid", "audio/x-midi"]:
            raise HTTPException(status_code=415, detail="Unsupported file type")
        config_model = ConfigModel(**json.loads(config))
        midi_bytes: bytes = await file.read()
        tokens, notes = procesor.tokenize_midi_file(config_model, midi_bytes)
        serialized_tokens = json.dumps(tokens, cls=TokSequenceEncoder)
        note_id = 1
        serialized_notes = []
        for track_notes in notes:
            serialized_track = [{**note.__dict__, "note_id": note_id + i} for i, note in enumerate(track_notes)]
            serialized_notes.append(serialized_track)
            note_id += len(track_notes)

        metrics: MusicInformationData = procesor.retrieve_information_from_midi(midi_bytes)
        return JSONResponse(
            content={
                "success": True,
                "data": {
                    "tokens": json.loads(serialized_tokens),
                    "notes": serialized_notes,
                    "metrics": json.loads(metrics.model_dump_json()),
                },
                "error": None,
            }
        )
    except HTTPException as e:
        return JSONResponse(
            content={"success": False, "data": None, "error": str(e.detail)}, status_code=e.status_code
        )
    except Exception as e:
        return JSONResponse(content={"success": False, "data": None, "error": str(e)}, status_code=500)

