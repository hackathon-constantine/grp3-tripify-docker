// filepath: src/infrastructure/config/jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET ,
  expiresIn: '24h',
  adminExpiresIn: '12h',
  cookieName: 'auth_token',
  adminCookieName: 'admin_auth_token'
};