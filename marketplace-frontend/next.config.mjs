/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_AUTH_FRONTEND_URL: process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
    AUTH_BACKEND_URL: process.env.AUTH_BACKEND_URL,
  },
};

export default nextConfig;
