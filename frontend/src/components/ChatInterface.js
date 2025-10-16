import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane, HiChip, HiUser, HiClock } from 'react-icons/hi';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser ? '#667eea' : '#10b981'};
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  background: ${props => props.isUser ? '#f3f4f6' : '#e0f2fe'};
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const MessageMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  margin-top: 1rem;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SendButton = styled(motion.button)`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TypingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
`;

const ChatInterface = ({ messages, onSendMessage, isProcessing, isLLMAvailable }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (inputValue.trim() && !isProcessing) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <ChatContainer>
            <MessagesContainer>
                <AnimatePresence>
                    {messages.map((message) => (
                        <Message
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <MessageAvatar isUser={message.type === 'user'}>
                                {message.type === 'user' ? <HiUser size={16} /> : <HiChip size={16} />}
                            </MessageAvatar>
                            <MessageContent isUser={message.type === 'user'}>
                                {message.content}
                                <MessageMeta>
                                    <HiClock size={12} />
                                    {formatTime(message.timestamp)}
                                    {message.confidence && (
                                        <span>Confidence: {(message.confidence * 100).toFixed(1)}%</span>
                                    )}
                                    {message.processingTime && (
                                        <span>Processing: {message.processingTime.toFixed(2)}s</span>
                                    )}
                                </MessageMeta>
                            </MessageContent>
                        </Message>
                    ))}
                </AnimatePresence>

                {isProcessing && (
                    <TypingIndicator
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <HiChip size={16} />
                        AI is analyzing your image...
                    </TypingIndicator>
                )}

                <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputContainer>
                <MessageInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isLLMAvailable ? "Ask the AI about what it sees..." : "AI service is not available"}
                    disabled={isProcessing || !isLLMAvailable}
                />
                <SendButton
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isProcessing || !isLLMAvailable}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HiPaperAirplane size={16} />
                </SendButton>
            </InputContainer>
        </ChatContainer>
    );
};

export default ChatInterface;
