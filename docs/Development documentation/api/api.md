# API

This API provides endpoints for processing MIDI files. It uses FastAPI to create a RESTful API that can tokenize MIDI files, extract note information, and retrieve musical metrics.

## Overview

The API has the following components:

- **FastAPI Application**: Handles HTTP requests and responses
- **CORS Middleware**: Configures Cross-Origin Resource Sharing
- **Logging Middleware**: Captures request/response details for debugging
- **Exception Handlers**: Manages validation and unexpected errors
- **MidiProcessor**: Core component for processing MIDI files

## Endpoints

### 1. Process MIDI File

```
POST /process
```

This endpoint processes a MIDI file according to the provided configuration.

#### Request

The request must be sent as `multipart/form-data` with the following fields:

| Field  | Type   | Description                                     |
|--------|--------|-------------------------------------------------|
| config | string | JSON configuration for MIDI processing          |
| file   | file   | MIDI file to process (.mid or .midi format)     |

The `config` field should contain a JSON object that conforms to the `ConfigModel` schema.

#### Response

```json
{
  "success": true,
  "data": {
    "tokens": [...],     // Tokenized MIDI data
    "notes": [...],      // Extracted notes with IDs
    "metrics": {...}     // Musical metrics and information
  },
  "error": null
}
```

#### Error Responses

- **415 Unsupported Media Type**: If the uploaded file is not a MIDI file
- **422 Unprocessable Entity**: If the request parameters are invalid
- **500 Internal Server Error**: If an unexpected error occurs during processing


### 2. Convert to MIDI

```
POST /convert-to-midi/
```

This endpoint converts processed musical data back into a MIDI file format.

#### Request

**Content-Type:** `application/json`

The request body should conform to the `MIDIConversionRequest` model structure:

```json
{
  "output_filename": "converted_song.mid",
  "events": [...],  // Array of MIDI events
  "tracks": [...],  // Track configuration
  // ... other conversion parameters
}
```

#### Response

**Success Response (200):**
- **Content-Type**: `audio/midi`
- **Content-Disposition**: `attachment; filename={output_filename}`
- **Body**: Binary MIDI file data

The response is a streaming download of the generated MIDI file.

#### Error Responses

- **500 Internal Server Error**: If an error occurs during MIDI conversion
  ```json
  {
    "detail": "An error occurred during MIDI conversion: {error_details}"
  }
  ```







## Error Handling

The API includes robust error handling:

1. **Validation Errors**: Returns a 422 status code with a message indicating invalid parameters
2. **HTTP Exceptions**: Returns the appropriate status code with a detailed error message
3. **Unexpected Errors**: Returns a 500 status code and logs the full stack trace for debugging

## Implementation Details



### Process Endpoint Logic

The `/process` endpoint performs these steps:

1. Validates that the uploaded file is a MIDI file
2. Parses the configuration from the form data
3. Reads the MIDI file as bytes
4. Tokenizes the MIDI file using the `MidiProcessor`
5. Extracts note information and assigns unique note IDs
6. Retrieves musical metrics and information
7. Returns all processed data as a JSON response


## Environment Variables

- `REACT_APP_API_BASE_URL`: The base URL for the React application (default: "http://localhost:3000")

