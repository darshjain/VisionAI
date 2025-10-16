#!/bin/bash

# AI Camera Assistant Setup Script
echo "🚀 Setting up AI Camera Assistant..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cat > .env << EOF
# Environment Configuration
OLLAMA_URL=http://ollama:11434
MODEL_NAME=llava:7b
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Camera Settings
CAMERA_WIDTH=640
CAMERA_HEIGHT=480
CAMERA_FPS=30

# Performance Settings
MAX_CONNECTIONS=10
FRAME_QUALITY=80
PROCESSING_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
DEBUG_MODE=false
EOF
fi

# Build and start services
echo "🔨 Building Docker containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if Ollama is running and pull the model
echo "📥 Setting up AI model..."
docker-compose exec ollama ollama pull llava:7b

echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Ollama API: http://localhost:11434"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update model: docker-compose exec ollama ollama pull llava:7b"
echo ""
echo "🎥 Make sure to grant camera permissions when prompted!"
