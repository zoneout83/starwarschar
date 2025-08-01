 /// <reference types="vite/client" />

    interface ImportMetaEnv {
      readonly VITE_APP_TITLE: string;
      readonly VITE_JWT_EXPIRES_MINUTES: string;
      readonly VITE_USERNAME: string;
      readonly VITE_PASSWORD: string;
      readonly VITE_AUTH_MOCK_USER: string;
      readonly VITE_AUTH_MOCK_PASS: string;
      readonly VITE_APP_SWAPI_BASE: string;
      readonly VITE_PROXY_URL: string;
      readonly VITE_USE_MOCK_AUTH: string;
      readonly VITE_JWT_AUTO_REFRESH_SECONDS: string;
      readonly VITE_APP_SWAPI_DELAY: string;
      readonly VITE_VERBOSE: string;

      // Add other environment variables here, e.g.,
      // readonly VITE_API_URL: string;
    }

    interface ImportMeta {
      readonly env: ImportMetaEnv;
    }