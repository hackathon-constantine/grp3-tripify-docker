export enum UserRoles {
  User = 'User',
  Vendeur = 'Vendeur',
  Admin = 'Admin'
}

export enum AuthEndpoints {
  REGISTER = '/auth/register',
  LOGIN = '/auth/login',
  ADMIN_LOGIN = '/auth/admin/login',
  LOGOUT = '/auth/logout',
  CURRENT_USER = '/auth/me'
}