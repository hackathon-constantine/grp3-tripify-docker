import { Controller, Post, Body, Res, HttpStatus, Get, Req, UseInterceptors } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '@domain/services/auth.service';
import { RegisterDto, LoginDto } from '@application/dto/auth.dto';
import { jwtConfig } from '@infrastructure/config/jwt.config';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { ResponseHandler } from '@application/interfaces/response';
import { Context, LoggerService } from '@domain/services/logger.service';
import { Public } from '@application/decorators/isPublic.decorator';

@Controller('auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  private Log: LoggerService = new LoggerService('AuthController');
  
  constructor(
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseHandler
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const context: Context = {
      module: 'AuthController',
      method: 'register'
    };
    
    this.Log.logger('Registering new user', context);
    const user = await this.authService.register(registerDto);
    this.Log.logger('User registered successfully', context);
    
    return ResponseHandler.success(
      user,
      'User registered successfully',
      'success',
      HttpStatus.CREATED
    );
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const context: Context = {
      module: 'AuthController',
      method: 'login'
    };
    
    this.Log.logger('User login attempt', context);
    const { user, token } = await this.authService.loginUser(loginDto);
    this.Log.logger('User logged in successfully', context);
    
    // Set JWT token in HTTP-only cookie
    this.setAuthCookie(response, token, jwtConfig.cookieName);
    
    return ResponseHandler.success(
      user,
      'User logged in successfully',
      'success',
      HttpStatus.OK
    );
  }

  @Public()
  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const context: Context = {
      module: 'AuthController',
      method: 'adminLogin'
    };
    
    this.Log.logger('Admin login attempt', context);
    const { user, token } = await this.authService.loginAdmin(loginDto);
    this.Log.logger('Admin logged in successfully', context);
    
    // Set JWT token in HTTP-only cookie
    this.setAuthCookie(response, token, jwtConfig.adminCookieName);
    
    return ResponseHandler.success(
      user,
      'Admin logged in successfully',
      'success',
      HttpStatus.OK
    );
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    const context: Context = {
      module: 'AuthController',
      method: 'logout'
    };
    
    this.Log.logger('User logout', context);
    
    // Clear auth cookies
    this.clearAuthCookie(response, jwtConfig.cookieName);
    this.clearAuthCookie(response, jwtConfig.adminCookieName);
    
    return ResponseHandler.success(
      null,
      'Logged out successfully',
      'success',
      HttpStatus.OK
    );
  }

  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    const context: Context = {
      module: 'AuthController',
      method: 'getCurrentUser'
    };
    
    this.Log.logger('Getting current user', context);
    
    // Get token from cookies
    const token = request.cookies[jwtConfig.cookieName] || request.cookies[jwtConfig.adminCookieName];
    
    if (!token) {
      return ResponseHandler.error(
        'Unauthorized',
        'Not authenticated',
        'error',  // Add the status string parameter
        HttpStatus.UNAUTHORIZED
      );
    }
    
    try {
      const decoded = await this.authService.validateToken(token);
      this.Log.logger('Current user retrieved successfully', context);
      
      return ResponseHandler.success(
        decoded,
        'User information retrieved successfully',
        'success',
        HttpStatus.OK
      );
    } catch (error) {
      return ResponseHandler.error(
        'Unauthorized',
        error.message,
        'error',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  private setAuthCookie(response: Response, token: string, cookieName: string): void {
    response.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
  }

  private clearAuthCookie(response: Response, cookieName: string): void {
    response.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  }
}