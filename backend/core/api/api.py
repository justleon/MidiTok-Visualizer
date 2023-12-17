from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Depends, Body
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json

from core.service.midi_processing import tokenize_midi_file
from core.service.serializer import TokSequenceEncoder
from core.api.model import ConfigModel

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://wimu-frontend-ccb0bbc023d3.herokuapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(content={"success": False, "data": None, "error": str(exc)},
                        status_code=422)


@app.post("/process")
async def process(config: ConfigModel = Body(...), file: UploadFile = File(...)):
    try:
        if file.content_type not in ["audio/mid", "audio/midi", "audio/x-mid", "audio/x-midi"]:
            raise HTTPException(status_code=415, detail="Unsupported file type")
        midi_bytes: bytes = await file.read()
        tokens: list = tokenize_midi_file(config, midi_bytes)
        serialized_tokens = json.dumps(tokens, cls=TokSequenceEncoder)
        return JSONResponse(content={"success": True, "data": json.loads(serialized_tokens), "error": None})
    except HTTPException as e:
        return JSONResponse(content={"success": False, "data": None, "error": str(e.detail)}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"success": False, "data": None, "error": str(e)}, status_code=500)
