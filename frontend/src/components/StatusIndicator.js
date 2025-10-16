import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Camera, CameraOff, Bot, BotOff, Loader } from 'react-icons/react';

const StatusContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const StatusItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
        if (props.status === 'connected') return 'rgba(16, 185, 129, 0.2)';
        if (props.status === 'disconnected') return 'rgba(239, 68, 68, 0.2)';
        if (props.status === 'processing') return 'rgba(59, 130, 246, 0.2)';
        if (props.status === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(156, 163, 175, 0.2)';
    }};
  color: ${props => {
        if (props.status === 'connected') return '#10b981';
        if (props.status === 'disconnected') return '#ef4444';
        if (props.status === 'processing') return '#3b82f6';
        if (props.status === 'warning') return '#f59e0b';
        return '#9ca3af';
    }};
`;

const StatusIndicator = ({
    isConnected,
    isCameraActive,
    isProcessing,
    isLLMAvailable,
    connectionError,
    cameraError,
    llmError
}) => {
    const getConnectionStatus = () => {
        if (connectionError) return 'disconnected';
        if (isConnected) return 'connected';
        return 'disconnected';
    };

    const getCameraStatus = () => {
        if (cameraError) return 'disconnected';
        if (isCameraActive) return 'connected';
        return 'disconnected';
    };

    const getLLMStatus = () => {
        if (llmError) return 'disconnected';
        if (isLLMAvailable) return 'connected';
        return 'warning';
    };

    return (
        <StatusContainer>
            <StatusItem
                status={getConnectionStatus()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                {isConnected ? 'Connected' : 'Disconnected'}
            </StatusItem>

            <StatusItem
                status={getCameraStatus()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {isCameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
                Camera {isCameraActive ? 'On' : 'Off'}
            </StatusItem>

            <StatusItem
                status={getLLMStatus()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                {isLLMAvailable ? <Bot size={16} /> : <BotOff size={16} />}
                AI {isLLMAvailable ? 'Ready' : 'Unavailable'}
            </StatusItem>

            {isProcessing && (
                <StatusItem
                    status="processing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Loader size={16} />
                    Processing
                </StatusItem>
            )}
        </StatusContainer>
    );
};

export default StatusIndicator;