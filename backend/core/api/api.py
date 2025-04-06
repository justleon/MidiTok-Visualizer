import json
import logging.config

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Body, FastAPI, File, HTTPException, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.staticfiles import StaticFiles

from core.api.logging_middleware import LoggingMiddleware, log_config
from core.api.model import ConfigModel, MusicInformationData
from core.service.midi_processing import retrieve_information_from_midi, tokenize_midi_file
from core.service.serializer import TokSequenceEncoder

logging.config.dictConfig(log_config)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://wimu-frontend-ccb0bbc023d3.herokuapp.com",
    "https://miditok-visualizer-production-frontend.up.railway.app",
]


app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

app.add_middleware(LoggingMiddleware, logger=logging.getLogger(__name__))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        content={"success": False, "data": None, "error": "Invalid request parameters"}, status_code=422
    )


def save_to_file(data, filename):  # debug function
    with open(filename, "w", encoding="utf-8") as f:
        f.write(str(data))


@app.post("/process")
async def process(config: ConfigModel = Body(...), file: UploadFile = File(...)) -> JSONResponse:
    try:
        if file.content_type not in ["audio/mid", "audio/midi", "audio/x-mid", "audio/x-midi"]:
            raise HTTPException(status_code=415, detail="Unsupported file type")
        midi_bytes: bytes = await file.read()
        tokens, notes = tokenize_midi_file(config, midi_bytes)
        serialized_tokens = json.dumps(tokens, cls=TokSequenceEncoder)
        note_id = 1
        serialized_notes = []
        for track_notes in notes:
            serialized_track = [{**note.__dict__, "note_id": note_id + i} for i, note in enumerate(track_notes)]
            serialized_notes.append(serialized_track)
            note_id += len(track_notes)

        metrics: MusicInformationData = retrieve_information_from_midi(midi_bytes)
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

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

@app.get("/{catch_all:path}")
async def catch_all(catch_all: str):
    return FileResponse("static/index.html")