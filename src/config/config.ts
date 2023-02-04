export const PER_PAGE = 10;
export const PER_PAGE_MATCHES = 50;
export const DEFAULT_COORDINATES = [51.8983513, 19.3617687];
export const imagesHeights = [30, 90, 180, 360, 540];
export const EMAIL_FROM = 'Fanatics Map';
export const LANGUAGES = ['pl', 'en', 'ru'];
export const DEFAULT_LANGUAGE = 'pl';

export const relationTypes = {
  friendship: 'friendship',
  agreement: 'agreement',
  positive: 'positive',
  satellite: 'satellite',
};
export const EXCEPTIONS_UNIMPORTANT_CLUBS_NAMES = ['Odra Centrum Wodzisław Śląski'];

type Config = {
  mongoConnection: string;
  backendUrl: string;
  frontendUrl: string;
  frontendUrlsCors: string[];
  adminUrl:  string;
  adminUrlsCors: string[];
  mainEmail:  string;
  emailServer:  string;
  emailUser:  string;
  emailPassword:  string;
  googleMapApiKey:  string;
  mockPassword:  string;
  allowCorsLocalhost: boolean;
  jwtSecret: string;
}

export const config: Config = {
  mongoConnection: process.env.MONGO_CONNECTION || '',
  backendUrl: process.env.BACKEND_URL || '',
  frontendUrl: process.env.FRONTEND_URL || '',
  frontendUrlsCors: process.env.FRONTEND_URLS_CORS?.split(',') || [],
  adminUrl: process.env.ADMIN_URL || '',
  adminUrlsCors: process.env.ADMIN_URLS_CORS?.split(',') || [],
  mainEmail: process.env.MAIN_EMAIL || '',
  emailServer: process.env.EMAIL_SERVER || '',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  googleMapApiKey: process.env.GOOGLE_MAP_API_KEY || '',
  mockPassword: process.env.MOCK_PASSWORD || '',
  allowCorsLocalhost: process.env.ALLOW_CORS_LOCALHOST === '1',
  jwtSecret: process.env.JWT_SECRET || '',
}