# LLM service
import httpx
import logging
from typing import Dict, Any
from app.models.schemas import LLMResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL
        self.model_name = settings.MODEL_NAME
        
    async def process_text_with_llm(self, prompt: str) -> LLMResponse:
        """Process text-only message with LLM using Ollama"""
        try:
            request_data = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate", json=request_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return LLMResponse(
                        response=result.get("response", "No response generated"),
                        confidence=0.9,
                        processing_time=result.get("total_duration", 0) / 1e9,
                    )
                else:
                    raise Exception(f"LLM API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"LLM text processing error: {e}")
            return LLMResponse(
                response=f"Error processing text: {str(e)}",
                confidence=0.0,
                processing_time=0.0,
            )

    async def process_image_with_llm(self, image_data: str, prompt: str = None) -> LLMResponse:
        """Process image with LLM using Ollama"""
        try:
            if prompt is None:
                prompt = "Analyze this image and provide helpful insights. Be conversational and helpful."
            
            request_data = {
                "model": self.model_name,
                "prompt": prompt,
                "images": [image_data],
                "stream": False,
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate", json=request_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return LLMResponse(
                        response=result.get("response", "No response generated"),
                        confidence=0.8,
                        processing_time=result.get("total_duration", 0) / 1e9,
                    )
                else:
                    raise Exception(f"LLM API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"LLM processing error: {e}")
            return LLMResponse(
                response=f"Error processing image: {str(e)}",
                confidence=0.0,
                processing_time=0.0,
            )
    
    async def get_status(self) -> Dict[str, Any]:
        """Get LLM service status"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model_available = any(model.get("name") == self.model_name for model in models)
                    return {
                        "status": "available",
                        "model_name": self.model_name,
                        "model_loaded": model_available,
                        "ollama_url": self.ollama_url,
                    }
                else:
                    return {
                        "status": "unavailable",
                        "error": f"Ollama API returned status {response.status_code}",
                        "ollama_url": self.ollama_url,
                    }
        except Exception as e:
            return {
                "status": "unavailable",
                "error": str(e),
                "ollama_url": self.ollama_url,
            }
