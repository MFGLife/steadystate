import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

app = FastAPI()

# --- 1. Load Models at Startup ---
model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
lora_path = "final-lora-adapter"  # Your trained LoRA adapter directory

# Device configuration
device = "cuda" if torch.cuda.is_available() else "cpu"

try:
    # Load base model
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto"
    )
    
    # Load LoRA adapter
    model = PeftModel.from_pretrained(model, lora_path)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Model loading failed: {str(e)}")
    raise

# --- 2. Request/Response Models ---
class Query(BaseModel):
    instruction: str
    context: str = ""

class Response(BaseModel):
    response: str

# --- 3. Core Endpoint ---
@app.post("/ask", response_model=Response)
async def ask_question(query: Query):
    try:
        # Format prompt
        prompt = f"### Instruction:\n{query.instruction}\n\n### Context:\n{query.context}\n\n### Response:"
        
        # Tokenize and generate
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.7,
            do_sample=True
        )
        
        # Decode and clean response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.split("### Response:")[-1].strip()
        
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. Health Check ---
@app.get("/")
async def health_check():
    return {"status": "OK", "device": device}

# --- 5. CORS Setup ---
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)