import axios from 'axios';
import { Env } from './env';

export const api = axios.create({
  baseURL: Env.apiBaseUrl || undefined,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

