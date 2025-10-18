import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiExclamation, HiCheckCircle, HiInformationCircle, HiRefresh } from 'react-icons/hi';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const InfoMessage = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' && `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  `}
`;

const ErrorModal = ({ isOpen, onClose, error, onRetry }) => {
    const getErrorIcon = () => {
        if (error?.type === 'connection') return <HiExclamation size={24} />;
        if (error?.type === 'camera') return <HiExclamation size={24} />;
        if (error?.type === 'llm') return <HiExclamation size={24} />;
        return <HiExclamation size={24} />;
    };

    const getErrorTitle = () => {
        if (error?.type === 'connection') return 'Connection Error';
        if (error?.type === 'camera') return 'Camera Error';
        if (error?.type === 'llm') return 'AI Service Error';
        return 'Error';
    };

    const getErrorSuggestions = () => {
        if (error?.type === 'connection') {
            return [
                'Check your internet connection',
                'Verify the backend server is running',
                'Try refreshing the page'
            ];
        }
        if (error?.type === 'camera') {
            return [
                'Ensure camera permissions are granted',
                'Check if camera is being used by another application',
                'Try restarting the camera'
            ];
        }
        if (error?.type === 'llm') {
            return [
                'Verify Ollama service is running',
                'Check if the AI model is loaded',
                'Try restarting the AI service'
            ];
        }
        return ['Please try again', 'Contact support if the issue persists'];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <ModalContent
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalHeader>
                            <ModalTitle>
                                {getErrorIcon()}
                                {getErrorTitle()}
                            </ModalTitle>
                            <CloseButton onClick={onClose}>
                                <HiX size={20} />
                            </CloseButton>
                        </ModalHeader>

                        <ModalBody>
                            <ErrorMessage>
                                <strong>Error Details:</strong>
                                <p style={{ marginTop: '0.5rem', color: '#dc2626' }}>
                                    {error?.message || 'An unexpected error occurred'}
                                </p>
                            </ErrorMessage>

                            <InfoMessage>
                                <strong>Suggested Solutions:</strong>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                    {getErrorSuggestions().map((suggestion, index) => (
                                        <li key={index} style={{ marginBottom: '0.25rem' }}>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </InfoMessage>
                        </ModalBody>

                        <ModalActions>
                            <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            {onRetry && (
                                <Button variant="primary" onClick={onRetry}>
                                    <HiRefresh size={16} style={{ marginRight: '0.5rem' }} />
                                    Retry
                                </Button>
                            )}
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </AnimatePresence>
    );
};

export default ErrorModal;
