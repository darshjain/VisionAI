import React, { useEffect, useRef } from 'react';
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

const VideoElement = styled.video`
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

const CameraComponent = ({ isActive, onFrameCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Start capturing frames
        startFrameCapture();
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startFrameCapture = () => {
    const captureFrame = () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Use fixed dimensions to ensure consistent encoding
        canvas.width = 640;
        canvas.height = 480;
        
        console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          console.warn('Video dimensions are 0, skipping frame capture');
          if (videoRef.current && videoRef.current.srcObject) {
            requestAnimationFrame(captureFrame);
          }
          return;
        }
        
        // Draw video to canvas with proper scaling
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        try {
          // Convert canvas to blob first, then to base64 with lower quality for smaller size
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('Blob size:', blob.size, 'bytes');
              
              // If blob is too large, reduce quality further
              if (blob.size > 500000) { // 500KB limit
                console.log('Blob too large, reducing quality...');
                canvas.toBlob((smallerBlob) => {
                  if (smallerBlob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataURL = reader.result;
                      const base64 = dataURL.split(',')[1];
                      
                      console.log('Captured frame (reduced), base64 length:', base64.length);
                      console.log('Base64 starts with:', base64.substring(0, 20));
                      
                      // Validate base64
                      if (base64 && base64.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
                        if (onFrameCapture) {
                          onFrameCapture(base64);
                        }
                      } else {
                        console.error('Invalid base64 data generated');
                      }
                    };
                    reader.readAsDataURL(smallerBlob);
                  }
                }, 'image/jpeg', 0.5); // Even lower quality
              } else {
                const reader = new FileReader();
                reader.onload = () => {
                  const dataURL = reader.result;
                  const base64 = dataURL.split(',')[1];
                  
                  console.log('Captured frame, base64 length:', base64.length);
                  console.log('Base64 starts with:', base64.substring(0, 20));
                  
                  // Validate base64
                  if (base64 && base64.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
                    if (onFrameCapture) {
                      onFrameCapture(base64);
                    }
                  } else {
                    console.error('Invalid base64 data generated');
                  }
                };
                reader.readAsDataURL(blob);
              }
            }
          }, 'image/jpeg', 0.6); // Reduced quality from 0.8 to 0.6
        } catch (error) {
          console.error('Error capturing frame:', error);
        }
      }
      
      // Continue capturing frames as long as camera is active
      if (videoRef.current && videoRef.current.srcObject) {
        requestAnimationFrame(captureFrame);
      }
    };
    
    requestAnimationFrame(captureFrame);
  };

  return (
    <CameraContainer>
      {isActive ? (
        <VideoElement
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
      ) : (
        <Placeholder
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <div>Camera Feed</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Click "Start Camera" to begin
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
