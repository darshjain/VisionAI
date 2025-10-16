import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'react-icons/react';

const ToastContainer = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Toast = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
        if (props.type === 'success') return '#10b981';
        if (props.type === 'error') return '#ef4444';
        if (props.type === 'warning') return '#f59e0b';
        return '#3b82f6';
    }};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 400px;
`;

const ToastIcon = styled.div`
  font-size: 1.25rem;
  color: ${props => {
        if (props.type === 'success') return '#10b981';
        if (props.type === 'error') return '#ef4444';
        if (props.type === 'warning') return '#f59e0b';
        return '#3b82f6';
    }};
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ToastMessage = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;

const ToastManager = ({ toasts, onRemove }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <AlertTriangle size={20} />;
            case 'warning':
                return <AlertTriangle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    return (
        <ToastContainer>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        type={toast.type}
                        initial={{ opacity: 0, x: 300, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ToastIcon type={toast.type}>
                            {getIcon(toast.type)}
                        </ToastIcon>
                        <ToastContent>
                            <ToastTitle>{toast.title}</ToastTitle>
                            <ToastMessage>{toast.message}</ToastMessage>
                        </ToastContent>
                        <CloseButton onClick={() => onRemove(toast.id)}>
                            <X size={16} />
                        </CloseButton>
                    </Toast>
                ))}
            </AnimatePresence>
        </ToastContainer>
    );
};

export default ToastManager;
