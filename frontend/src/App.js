import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, MicOff, Send, Loader, Bot, User, LogOut } from 'react-icons/react';
import CameraComponent from './components/CameraComponent';
import ChatInterface from './components/ChatInterface';
import StatusIndicator from './components/StatusIndicator';
import ErrorModal from './components/ErrorModal';
import ToastManager from './components/ToastManager';
import LoginScreen from './components/LoginScreen';
import { WebSocketService } from './services/WebSocketService';
import { ApiService } from './services/ApiService';
import AuthService from './services/AuthService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled(motion.header)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const LogoutButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MainContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const CameraSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const ChatSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const ControlButton = styled(motion.button)`
  background: ${props => props.active ? '#667eea' : 'rgba(102, 126, 234, 0.1)'};
  color: ${props => props.active ? 'white' : '#667eea'};
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [isLLMAvailable, setIsLLMAvailable] = useState(false);
  
  // Error states
  const [connectionError, setConnectionError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [llmError, setLLMError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  const wsService = useRef(new WebSocketService());
  const apiService = useRef(new ApiService());
  const authService = useRef(new AuthService());

    // Helper functions
    const addToast = (type, title, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showError = (error) => {
        setCurrentError(error);
        setShowErrorModal(true);
    };

  const checkAuthStatus = async () => {
    if (authService.current.isAuthenticated()) {
      try {
        const result = await authService.current.getCurrentUser();
        if (result.success) {
          setCurrentUser(result.data);
          setIsAuthenticated(true);
        } else {
          authService.current.clearTokens();
          setIsAuthenticated(false);
        }
      } catch (error) {
        authService.current.clearTokens();
        setIsAuthenticated(false);
      }
    }
  };

  const checkLLMService = async () => {
    try {
      const response = await fetch('http://localhost:8000/llm/status');
      if (response.ok) {
        setIsLLMAvailable(true);
        setLLMError(null);
      } else {
        setIsLLMAvailable(false);
        setLLMError({ type: 'llm', message: 'LLM service is not available' });
      }
    } catch (error) {
      setIsLLMAvailable(false);
      setLLMError({ type: 'llm', message: 'Cannot connect to LLM service' });
    }
  };

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
    checkAuthStatus();
    addToast('success', 'Welcome!', 'Successfully logged in');
  };

  const handleLogout = async () => {
    await authService.current.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
    setCurrentFrame(null);
    addToast('success', 'Goodbye!', 'Successfully logged out');
  };

  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
    
    // Check LLM service availability
    checkLLMService();
    
    // Initialize WebSocket connection
    wsService.current.connect('ws://localhost:8000/ws');

        wsService.current.onMessage = (data) => {
            if (data.type === 'frame') {
                setCurrentFrame(data.data);
            } else if (data.type === 'llm_response') {
                setIsProcessing(false);
                const response = data.data;
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'ai',
                    content: response.response,
                    timestamp: new Date(),
                    confidence: response.confidence,
                    processingTime: response.processing_time
                }]);
                addToast('success', 'AI Response', 'AI analysis completed successfully!');
            } else if (data.type === 'error') {
                setIsProcessing(false);
                const error = { type: 'llm', message: data.message };
                setLLMError(error);
                showError(error);
                addToast('error', 'AI Error', data.message);
            }
        };

        wsService.current.onConnect = () => {
            setIsConnected(true);
            setConnectionError(null);
            addToast('success', 'Connected', 'Connected to AI Assistant');
        };

        wsService.current.onDisconnect = () => {
            setIsConnected(false);
            const error = { type: 'connection', message: 'Lost connection to server' };
            setConnectionError(error);
            addToast('error', 'Disconnected', 'Lost connection to AI Assistant');
        };

        return () => {
            wsService.current.disconnect();
        };
    }, []);

    const startCamera = async () => {
        try {
            setCameraError(null);
            await apiService.current.startCamera({
                width: 640,
                height: 480,
                fps: 30
            });
            setIsCameraActive(true);
            addToast('success', 'Camera Started', 'Camera is now active');
        } catch (error) {
            const cameraError = { type: 'camera', message: error.message || 'Failed to start camera' };
            setCameraError(cameraError);
            showError(cameraError);
            addToast('error', 'Camera Error', 'Failed to start camera');
            console.error('Camera start error:', error);
        }
    };

    const stopCamera = async () => {
        try {
            setCameraError(null);
            await apiService.current.stopCamera();
            setIsCameraActive(false);
            setCurrentFrame(null);
            addToast('success', 'Camera Stopped', 'Camera has been stopped');
        } catch (error) {
            const cameraError = { type: 'camera', message: error.message || 'Failed to stop camera' };
            setCameraError(cameraError);
            showError(cameraError);
            addToast('error', 'Camera Error', 'Failed to stop camera');
            console.error('Camera stop error:', error);
        }
    };

    const processImage = async (prompt = 'Analyze this image and provide helpful insights.') => {
        if (!currentFrame) {
            addToast('warning', 'No Image', 'No image available to process');
            return;
        }

        if (!isLLMAvailable) {
            const error = { type: 'llm', message: 'AI service is not available' };
            setLLMError(error);
            showError(error);
            addToast('error', 'AI Unavailable', 'AI service is not available');
            return;
        }

        setIsProcessing(true);
        setLLMError(null);
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            content: prompt,
            timestamp: new Date()
        }]);

        try {
            wsService.current.send({
                type: 'process_image',
                image_data: currentFrame,
                prompt: prompt
            });
        } catch (error) {
            setIsProcessing(false);
            const llmError = { type: 'llm', message: error.message || 'Failed to process image' };
            setLLMError(llmError);
            showError(llmError);
            addToast('error', 'Processing Error', 'Failed to process image');
            console.error('Image processing error:', error);
        }
    };

    const sendMessage = (message) => {
        if (message.trim()) {
            processImage(message);
        }
    };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppContainer>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>
          <Bot size={32} />
          VisionAI
        </Title>
        
        <UserInfo>
          <UserAvatar>
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </UserAvatar>
          <span>{currentUser?.username || 'User'}</span>
          <LogoutButton
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={16} />
            Logout
          </LogoutButton>
        </UserInfo>
        
        <StatusIndicator 
          isConnected={isConnected}
          isCameraActive={isCameraActive}
          isProcessing={isProcessing}
          isLLMAvailable={isLLMAvailable}
          connectionError={connectionError}
          cameraError={cameraError}
          llmError={llmError}
        />
      </Header>

            <MainContent>
                <CameraSection
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <CameraComponent
                        frame={currentFrame}
                        isActive={isCameraActive}
                    />

                    <ControlPanel>
                        <ControlButton
                            onClick={isCameraActive ? stopCamera : startCamera}
                            active={isCameraActive}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Camera size={20} />
                            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                        </ControlButton>

                        <ControlButton
                            onClick={() => processImage()}
                            disabled={!isCameraActive || isProcessing || !isLLMAvailable}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isProcessing ? <Loader size={20} /> : <Send size={20} />}
                            {isProcessing ? 'Processing...' : 'Ask AI'}
                        </ControlButton>
                    </ControlPanel>
                </CameraSection>

                <ChatSection
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <ChatInterface
                        messages={messages}
                        onSendMessage={sendMessage}
                        isProcessing={isProcessing}
                        isLLMAvailable={isLLMAvailable}
                    />
                </ChatSection>
            </MainContent>

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                error={currentError}
                onRetry={() => {
                    if (currentError?.type === 'connection') {
                        wsService.current.connect('ws://localhost:8000/ws');
                    } else if (currentError?.type === 'camera') {
                        if (isCameraActive) {
                            stopCamera();
                        } else {
                            startCamera();
                        }
                    } else if (currentError?.type === 'llm') {
                        checkLLMService();
                    }
                    setShowErrorModal(false);
                }}
            />

            {/* Toast Notifications */}
            <ToastManager toasts={toasts} onRemove={removeToast} />
        </AppContainer>
    );
}

export default App;
