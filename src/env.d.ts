/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COG_SERVICE_KEY: string;
  readonly VITE_COG_SERVICE_LOCATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
