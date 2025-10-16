import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoFrame = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Placeholder = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.1rem;
  font-weight: 500;
`;

const StatusOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const CameraComponent = ({ frame, isActive }) => {
  return (
    <CameraContainer>
      {frame ? (
        <VideoFrame src={`data:image/jpeg;base64,${frame}`} alt="Camera feed" />
      ) : (
        <Placeholder
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <div>Camera Feed</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
            {isActive ? 'Starting camera...' : 'Click "Start Camera" to begin'}
          </div>
        </Placeholder>
      )}
      
      {isActive && (
        <StatusOverlay>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#4ade80',
              animation: 'pulse 2s infinite'
            }} />
            LIVE
          </div>
        </StatusOverlay>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </CameraContainer>
  );
};

export default CameraComponent;
