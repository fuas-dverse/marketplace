namespace NodeJS {
  interface ProcessEnv {
    NATS_SERVER_URL: string;
    FASTAPI_URL: string | undefined;
    CUDA_DEVICE: number;
    WEBSOCKET_URL: string | undefined;
    API_URL: string;
    PORT: string;
    NEXT_PUBLIC_AUTH_FRONTEND_URL: string | undefined;
    NEXT_PUBLIC_AUTH_BACKEND_URL: string | undefined;
  }
}
