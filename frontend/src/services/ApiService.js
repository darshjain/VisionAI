import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  async startCamera(config) {
    const response = await this.client.post('/camera/start', config);
    return response.data;
  }

  async stopCamera() {
    const response = await this.client.post('/camera/stop');
    return response.data;
  }

  async getCameraStatus() {
    const response = await this.client.get('/camera/status');
    return response.data;
  }

  async processImage(imageData, prompt) {
    const response = await this.client.post('/llm/process', {
      image_data: imageData,
      prompt: prompt
    });
    return response.data;
  }
}

export { ApiService };
