"""
Chord Genesis Audio Analysis API
FastAPI backend for style replication and audio analysis
"""

import os
import tempfile
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from audio_analyzer import AudioAnalyzer, AudioFeatures
from prompt_generator import PromptGenerator, quick_prompt, style_match_prompt, get_variations

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Chord Genesis Audio Analysis API",
    description="Analyze audio files and generate ElevenLabs prompts for style replication",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3001",
        "https://zaylegend.com",
        "https://www.zaylegend.com",
        "*"  # Allow all during development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
analyzer = AudioAnalyzer()
prompt_gen = PromptGenerator()


# Response Models
class AnalysisResponse(BaseModel):
    success: bool
    features: dict
    primary_prompt: str
    style_prompt: str
    variations: List[dict]


class PromptResponse(BaseModel):
    success: bool
    prompt: str


class HealthResponse(BaseModel):
    status: str
    version: str


# Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(
    file: UploadFile = File(...),
    style_hints: Optional[str] = Form(None),
    custom_additions: Optional[str] = Form(None)
):
    """
    Analyze an uploaded audio file and generate prompts.

    - **file**: Audio file (mp3, wav, flac, ogg, m4a)
    - **style_hints**: Comma-separated style hints (e.g., "j dilla, lo-fi, jazz")
    - **custom_additions**: Additional text to include in prompts
    """
    # Validate file type
    allowed_types = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']
    allowed_extensions = ['.mp3', '.wav', '.flac', '.ogg', '.m4a']

    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ''

    if file.content_type not in allowed_types and file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Save to temp file
    try:
        suffix = file_ext or '.mp3'
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Analyze
        features = analyzer.analyze(tmp_path)

        # Parse style hints
        hints = None
        if style_hints:
            hints = [h.strip() for h in style_hints.split(',') if h.strip()]

        # Generate prompts
        primary_prompt = prompt_gen.generate_prompt(
            features,
            style_hints=hints,
            custom_additions=custom_additions
        )
        style_prompt = prompt_gen.generate_style_prompt(features)
        variations = prompt_gen.generate_variation_prompts(features, 3)

        # Cleanup
        os.unlink(tmp_path)

        return {
            "success": True,
            "features": features.to_dict(),
            "primary_prompt": primary_prompt,
            "style_prompt": style_prompt,
            "variations": variations
        }

    except Exception as e:
        # Cleanup on error
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-prompt")
async def generate_prompt_from_features(
    features: dict,
    style_hints: Optional[List[str]] = None,
    custom_additions: Optional[str] = None
):
    """
    Generate prompts from pre-extracted features (no file upload needed)

    - **features**: Audio features dict (from /analyze endpoint)
    - **style_hints**: List of style hints
    - **custom_additions**: Additional text to include
    """
    try:
        # Reconstruct AudioFeatures from dict
        audio_features = AudioFeatures(**features)

        prompt = prompt_gen.generate_prompt(
            audio_features,
            style_hints=style_hints,
            custom_additions=custom_additions
        )

        return {
            "success": True,
            "prompt": prompt
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/variations")
async def get_prompt_variations(
    features: dict,
    count: int = 3
):
    """
    Generate multiple prompt variations from features

    - **features**: Audio features dict
    - **count**: Number of variations (1-5)
    """
    count = max(1, min(5, count))

    try:
        audio_features = AudioFeatures(**features)
        variations = prompt_gen.generate_variation_prompts(audio_features, count)

        return {
            "success": True,
            "variations": variations
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/quick-prompt", response_model=PromptResponse)
async def quick_analyze(
    file: UploadFile = File(...)
):
    """
    Quick analysis - upload audio, get a single optimized prompt.
    Ideal for drag-and-drop style matching.
    """
    # Validate
    allowed_extensions = ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ''

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    try:
        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        features = analyzer.analyze(tmp_path)
        prompt = style_match_prompt(features)

        os.unlink(tmp_path)

        return {"success": True, "prompt": prompt}

    except Exception as e:
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))


# Development server
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3020))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
