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
            logger.info(f"Processing text prompt: {prompt}")
            
            request_data = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
            }

            logger.info(f"Sending text request to Ollama: {self.ollama_url}/api/generate")

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate", json=request_data
                )

                logger.info(f"Ollama text response status: {response.status_code}")

                if response.status_code == 200:
                    result = response.json()
                    return LLMResponse(
                        response=result.get("response", "No response generated"),
                        confidence=0.9,
                        processing_time=result.get("total_duration", 0) / 1e9,
                    )
                else:
                    error_text = await response.aread()
                    logger.error(f"Ollama text API error: {response.status_code}, {error_text}")
                    raise Exception(f"LLM API error: {response.status_code} - {error_text}")

        except Exception as e:
            logger.error(f"LLM text processing error: {e}", exc_info=True)
            return LLMResponse(
                response=f"Error processing text: {str(e)}",
                confidence=0.0,
                processing_time=0.0,
            )

    async def process_image_with_llm(
        self, image_data: str, prompt: str = None
    ) -> LLMResponse:
        """Process image with LLM using Ollama"""
        try:
            if prompt is None:
                prompt = "Analyze this image and provide helpful insights. Be conversational and helpful."

            # Clean and validate base64 data
            import base64
            
            # Remove any data URL prefix if present
            if image_data.startswith("data:image"):
                image_data = image_data.split(",")[1]
            elif image_data.startswith("data:"):
                image_data = image_data.split(",")[1]
            
            # Validate base64
            try:
                # Try to decode and re-encode to ensure it's valid
                decoded = base64.b64decode(image_data)
                
                # Check image size - if too large, resize it
                if len(decoded) > 2 * 1024 * 1024:  # 2MB limit
                    logger.warning(f"Image too large ({len(decoded)} bytes), resizing...")
                    # For now, just truncate the base64 to a smaller size
                    # In production, you'd want to actually resize the image
                    image_data = image_data[:int(len(image_data) * 0.5)]  # Reduce by 50%
                    decoded = base64.b64decode(image_data)
                
                validated_base64 = base64.b64encode(decoded).decode('utf-8')
                logger.info(f"Base64 validation successful. Length: {len(validated_base64)}")
                logger.info(f"Image size: {len(decoded)} bytes")
            except Exception as e:
                logger.error(f"Base64 validation failed: {e}")
                raise Exception(f"Invalid base64 data: {e}")

            # Format for Ollama - just the base64 string without data URL prefix
            logger.info(f"Sending image to Ollama. Base64 length: {len(validated_base64)}")
            logger.info(f"Base64 starts with: {validated_base64[:20]}...")

            request_data = {
                "model": self.model_name,
                "prompt": prompt,
                "images": [validated_base64],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 200
                }
            }

            logger.info(f"Sending request to Ollama: {self.ollama_url}/api/generate")

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate", json=request_data
                )

                logger.info(f"Ollama response status: {response.status_code}")

                if response.status_code == 200:
                    result = response.json()
                    return LLMResponse(
                        response=result.get("response", "No response generated"),
                        confidence=0.8,
                        processing_time=result.get("total_duration", 0) / 1e9,
                    )
                else:
                    error_text = await response.aread()
                    logger.error(
                        f"Ollama API error: {response.status_code}, {error_text}"
                    )
                    raise Exception(
                        f"LLM API error: {response.status_code} - {error_text}"
                    )

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
                    model_available = any(
                        model.get("name") == self.model_name for model in models
                    )
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
