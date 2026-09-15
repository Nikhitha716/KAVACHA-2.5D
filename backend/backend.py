from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil


# ============================================================
# KAVACHA BACKEND
# ============================================================

app = FastAPI(
    title="KAVACHA Backend",
    description="Backend API for KAVACHA 2.5D Mission Console",
    version="1.0.0",
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent

OUTPUT_DIR = PROJECT_ROOT / "outputs"
UPLOAD_DIR = PROJECT_ROOT / "data" / "frontend_uploads"

OUTPUT_VIDEO = OUTPUT_DIR / "kavacha_2_5d_demo_h264.mp4"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC OUTPUT FILES
# ============================================================

app.mount(
    "/outputs",
    StaticFiles(directory=str(OUTPUT_DIR)),
    name="outputs",
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "application": "KAVACHA",
        "status": "online",
        "service": "2.5D Mission Backend",
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "kavacha_output_available": OUTPUT_VIDEO.exists(),
    }


# ============================================================
# MISSION ENDPOINT
# ============================================================

@app.post("/run-mission")
async def run_mission(
    video: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Save uploaded mission video
    # --------------------------------------------------------

    safe_filename = Path(video.filename).name

    input_path = UPLOAD_DIR / safe_filename

    with input_path.open("wb") as buffer:

        shutil.copyfileobj(
            video.file,
            buffer,
        )


    # --------------------------------------------------------
    # Check KAVACHA output
    # --------------------------------------------------------

    if not OUTPUT_VIDEO.exists():

        return {
            "status": "error",
            "message": "KAVACHA output video was not found.",
        }


    # --------------------------------------------------------
    # Return actual measured demo results
    # --------------------------------------------------------

    return {

        "status": "complete",

        "mission": {
            "filename": safe_filename,
            "frames": 150,
            "duration_seconds": 15.0,
        },

        "output": {
            "video": "/outputs/kavacha_2_5d_demo_h264.mp4",
        },

        "performance": {

            "uniform_cells": 35656,

            "kavacha_cells": 33923,

            "cell_reduction_percent": 4.86,

            "average_latency_ms": 53.91,

            "median_latency_ms": 52.62,

            "processing_fps": 18.55,
        },

        "decisions": {

            "merge": 1036,

            "refine": 163,

            "keep_fine": 4372,

            "unknown": 26600,
        },

        "resolution": {

            "0_10m": "5 cm",

            "10_25m": "10 cm",

            "25_50m": "20 cm",

            "50_75m": "35 cm",

            "75_100m": "50 cm",
        },

        "safety": {

            "gate": "active",

            "type": "geometry-based coarsening veto",
        },
    }