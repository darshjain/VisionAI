class CameraService {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.isActive = false;
        this.constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        };
    }

    async startCamera() {
        try {
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);

            // Create video element if it doesn't exist
            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.style.display = 'none';
                this.videoElement.playsInline = true;
                document.body.appendChild(this.videoElement);
            }

            // Set video source
            this.videoElement.srcObject = this.stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });

            this.isActive = true;
            console.log('Camera started successfully');
            return { success: true };
        } catch (error) {
            console.error('Failed to start camera:', error);
            this.isActive = false;
            return { success: false, error: error.message };
        }
    }

    async stopCamera() {
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }

            if (this.videoElement) {
                this.videoElement.srcObject = null;
            }

            this.isActive = false;
            console.log('Camera stopped');
            return { success: true };
        } catch (error) {
            console.error('Failed to stop camera:', error);
            return { success: false, error: error.message };
        }
    }

    captureFrame() {
        if (!this.isActive || !this.videoElement) {
            return null;
        }

        try {
            // Create canvas to capture frame
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set canvas size to video size
            canvas.width = this.videoElement.videoWidth;
            canvas.height = this.videoElement.videoHeight;

            // Draw video frame to canvas
            context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

            // Convert to base64
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            const base64 = dataURL.split(',')[1]; // Remove data:image/jpeg;base64, prefix

            return base64;
        } catch (error) {
            console.error('Failed to capture frame:', error);
            return null;
        }
    }

    getVideoElement() {
        return this.videoElement;
    }

    isCameraActive() {
        return this.isActive;
    }
}

export { CameraService };
