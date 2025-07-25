import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api' // Android Emulator
    : 'http://localhost:3000/api' // iOS Simulator
  : 'http://localhost:3000/api'; // Replace with your production API URL

class ApiService {
  private static instance: ApiService;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async config => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          // Navigate to login - would need navigation service
        }
        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Auth methods
  public async signup(email: string, password: string, role: 'psp' | 'dev') {
    const response = await this.axiosInstance.post('/auth/signup', {
      email,
      password,
      role,
    });
    return response.data;
  }

  public async login(email: string, password: string) {
    const response = await this.axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Transaction methods
  public async getTransactions() {
    const response = await this.axiosInstance.get('/transactions');
    return response.data;
  }

  public async sendPayment(
    recipient: string,
    amount: number,
    currency: string,
  ) {
    const response = await this.axiosInstance.post('/send', {
      recipient,
      amount,
      currency,
    });
    return response.data;
  }
}

export default ApiService.getInstance();
