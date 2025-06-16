/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COG_SERVICE_KEY: string;
  readonly VITE_COG_SERVICE_LOCATION: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
