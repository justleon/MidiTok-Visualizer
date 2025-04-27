import pytest
from fastapi.testclient import TestClient

from core.api.api import app
from core.constants import EXAMPLE_MIDI_FILE_PATH

client = TestClient(app)


@pytest.fixture
def event_loop():
    import asyncio

    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.mark.asyncio
async def test_upload_file():
    with open(EXAMPLE_MIDI_FILE_PATH, "rb") as file:
        form_data = {"file": file}
        response = client.post("/process", files=form_data)
        assert response.status_code == 422
