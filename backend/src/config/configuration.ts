export default () => ({
  // Servidor
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'devlmer',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'dysaeats',
  },
  
  // Supabase para Event Sourcing
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    webhookToken: process.env.SUPABASE_WEBHOOK_TOKEN || 'webhook-secret-token',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'secretKey',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  // URLs de aplicaciones
  dashboardWebUrl: process.env.DASHBOARD_WEB_URL || 'http://localhost:3000',
  dashboardMobileUrl: process.env.DASHBOARD_MOBILE_URL || 'http://localhost:8081',
  
  // Configuraciones de limitador de velocidad
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
  
  // Google Maps API
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  
  // Mercado Pago
  mercadopago: {
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
  },
});