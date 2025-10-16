# AI Camera Assistant

A production-ready application that deploys a live LLM model with camera access for real-time communication and problem-solving assistance.

## 🚀 Features

- **Real-time Camera Integration**: Live camera feed with WebSocket streaming
- **AI-Powered Analysis**: Uses Ollama with LLaVA model for image understanding
- **Modern UI**: Beautiful, responsive React frontend with smooth animations
- **Error Handling**: Comprehensive error management with user-friendly modals
- **Docker Deployment**: Fully containerized for easy deployment
- **WebSocket Communication**: Real-time bidirectional communication
- **Status Monitoring**: Live status indicators for all services

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **OpenCV**: Computer vision and camera handling
- **Ollama**: Local LLM inference with LLaVA model
- **WebSockets**: Real-time communication
- **Docker**: Containerized deployment

### Frontend
- **React**: Modern UI framework
- **Styled Components**: CSS-in-JS styling
- **Framer Motion**: Smooth animations
- **React Icons**: Beautiful icon set
- **Axios**: HTTP client

## 📋 Prerequisites

- Docker and Docker Compose
- Camera access permissions
- At least 4GB RAM for the LLM model
- Modern web browser with WebSocket support

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd ai_chat
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Ollama API: http://localhost:11434

3. **Grant Camera Permissions**
   - Allow camera access when prompted by your browser
   - Click "Start Camera" in the application

## 🎯 Usage

1. **Start Camera**: Click the "Start Camera" button to begin live video feed
2. **Ask AI**: Click "Ask AI" or type a question in the chat to analyze the current camera frame
3. **Real-time Chat**: Interact with the AI about what it sees through the camera
4. **Error Handling**: The app will show helpful error messages if services are unavailable

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following settings:

```env
# LLM Configuration
OLLAMA_URL=http://ollama:11434
MODEL_NAME=llava:7b

# Camera Settings
CAMERA_WIDTH=640
CAMERA_HEIGHT=480
CAMERA_FPS=30

# Performance
FRAME_QUALITY=80
PROCESSING_TIMEOUT=30
```

### Model Selection
The default model is `llava:7b` (7 billion parameters). You can use other models:

```bash
# Pull different models
docker-compose exec ollama ollama pull llava:13b  # Larger, more accurate
docker-compose exec ollama ollama pull llava:7b   # Default, faster
```

## 🐳 Docker Services

- **backend**: FastAPI application with camera and LLM integration
- **frontend**: React application with modern UI
- **ollama**: LLM inference service

## 📊 API Endpoints

### Camera Management
- `POST /camera/start` - Start camera capture
- `POST /camera/stop` - Stop camera capture
- `GET /camera/status` - Get camera status

### LLM Processing
- `GET /llm/status` - Check LLM service availability
- `POST /llm/process` - Process image with LLM

### WebSocket
- `WS /ws` - Real-time communication endpoint

## 🔍 Error Handling

The application includes comprehensive error handling:

- **Connection Errors**: WebSocket disconnection handling
- **Camera Errors**: Permission and hardware issues
- **LLM Errors**: Service unavailability and processing failures
- **User-Friendly Modals**: Detailed error information with retry options
- **Toast Notifications**: Real-time status updates

## 🚀 Production Deployment

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Setup
1. Ensure camera permissions are granted
2. Verify Docker has access to camera devices
3. Monitor system resources (RAM usage for LLM)
4. Configure firewall rules if needed

## 🔧 Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check browser permissions
   - Verify camera is not used by another application
   - Try refreshing the page

2. **LLM Service Unavailable**
   - Check if Ollama container is running: `docker-compose ps`
   - Verify model is loaded: `docker-compose exec ollama ollama list`
   - Check logs: `docker-compose logs ollama`

3. **Connection Issues**
   - Verify all services are running: `docker-compose ps`
   - Check port availability (3000, 8000, 11434)
   - Review firewall settings

### Debug Commands
```bash
# Check service status
docker-compose ps

# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Access container shell
docker-compose exec backend bash
```

## 📈 Performance Optimization

- **Model Selection**: Use smaller models (7b) for faster processing
- **Frame Quality**: Adjust `FRAME_QUALITY` in .env for balance
- **Camera Resolution**: Lower resolution for better performance
- **Resource Monitoring**: Monitor RAM usage during LLM processing

## 🔒 Security Considerations

- **Camera Access**: Only grant permissions to trusted applications
- **Network Security**: Use HTTPS in production
- **Resource Limits**: Set Docker resource limits
- **Model Security**: Use trusted model sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Ollama for providing the LLM inference engine
- LLaVA team for the vision-language model
- FastAPI and React communities for excellent frameworks
