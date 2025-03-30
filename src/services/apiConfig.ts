
import axios from "axios";

export const WP_API_BASE_URL = "https://hcm.sithethao.com/wp-json/wp/v2";
export const WC_API_BASE_URL = "https://hcm.sithethao.com/wp-json/wc/v3";
export const STOCKWAVE_API_BASE_URL = "https://hcm.sithethao.com/wp-json/stockwave/v1";

export interface ApiCredentials {
  wpUsername: string;
  wpPassword: string;
  consumerKey: string;
  consumerSecret: string;
}

export const getStoredCredentials = (): ApiCredentials | null => {
  const credentialsStr = localStorage.getItem("stockwave_credentials");
  if (!credentialsStr) return null;
  
  try {
    return JSON.parse(credentialsStr);
  } catch (error) {
    console.error("Failed to parse stored credentials", error);
    return null;
  }
};

export const storeCredentials = (credentials: ApiCredentials) => {
  localStorage.setItem("stockwave_credentials", JSON.stringify(credentials));
};

export const wpApiClient = axios.create({
  baseURL: WP_API_BASE_URL,
});

export const wcApiClient = axios.create({
  baseURL: WC_API_BASE_URL,
});

wpApiClient.interceptors.request.use((config) => {
  const credentials = getStoredCredentials();
  if (credentials) {
    const { wpUsername, wpPassword } = credentials;
    const auth = btoa(`${wpUsername}:${wpPassword}`);
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});

wcApiClient.interceptors.request.use((config) => {
  const credentials = getStoredCredentials();
  if (credentials) {
    const { consumerKey, consumerSecret } = credentials;
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});
