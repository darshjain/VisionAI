import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    // Use the global axios instance to inherit auth headers
    this.client = axios;
  }

  async startCamera(config) {
    const response = await this.client.post(`${this.baseURL}/camera/start`, config);
    return response.data;
  }

  async stopCamera() {
    const response = await this.client.post(`${this.baseURL}/camera/stop`);
    return response.data;
  }

  async getCameraStatus() {
    const response = await this.client.get(`${this.baseURL}/camera/status`);
    return response.data;
  }

  async processImage(imageData, prompt) {
    const response = await this.client.post(`${this.baseURL}/llm/process`, {
      image_data: imageData,
      prompt: prompt
    });
    return response.data;
  }

  async sendMessage(message) {
    const response = await this.client.post(`${this.baseURL}/llm/chat`, {
      prompt: message
    });
    return response.data;
  }
}

export { ApiService };
