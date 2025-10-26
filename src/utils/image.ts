// src/utils/image.ts
const BACKEND_URL = import.meta.env.VITE_API_URL;

export const backendImage = (path: string) => {
  if (!path) return "/placeholder.png"; // Por si viene vacío
  return path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
};

console.log(`${BACKEND_URL}`);