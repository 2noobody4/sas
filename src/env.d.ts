/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;

    readonly REACT_APP_SUPABASE_URL: string;
    readonly REACT_APP_SUPABASE_ANON_KEY: string;
    readonly REACT_APP_GA_TRACKING_ID: string;
    readonly REACT_APP_APP_NAME: string;
    readonly REACT_APP_API_URL: string;
  }
}
