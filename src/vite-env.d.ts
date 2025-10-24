/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string; // ajusta si quieres más variables
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
