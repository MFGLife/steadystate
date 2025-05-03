from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Critical CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For now, tighten later
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post("/ask")
async def ask_question(query: dict):
    # Your existing AI logic here
    return {"response": generated_text}