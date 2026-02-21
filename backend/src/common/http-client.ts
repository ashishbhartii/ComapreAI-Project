import axios from 'axios';
import Agent from 'agentkeepalive';

const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

const httpsAgent = new Agent.HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

export const httpClient = axios.create({
  timeout: 60000,
  httpAgent: keepAliveAgent,
  httpsAgent: httpsAgent,
});

httpClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  },
);
