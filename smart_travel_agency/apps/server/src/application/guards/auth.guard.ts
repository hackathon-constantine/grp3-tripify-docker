import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthService } from '@domain/services/auth.service';
import { jwtConfig } from '@infrastructure/config/jwt.config';
import { IS_PUBLIC_KEY } from '@application/decorators/isPublic.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Get token from cookie
    const token = request.cookies[jwtConfig.cookieName] || request.cookies[jwtConfig.adminCookieName];
    
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }
    
    return this.validateToken(token, request);
  }

  private async validateToken(token: string, request: any): Promise<boolean> {
    try {
      const payload = await this.authService.validateToken(token);
      // Add user to request object
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}