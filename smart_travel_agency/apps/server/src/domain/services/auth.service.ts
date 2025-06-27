import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '@infrastructure/repository/user.repository';
import { RegisterDto, LoginDto } from '@application/dto/auth.dto';
import { User, UserRoles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '@infrastructure/config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user with User role
    const user = await this.userRepository.excuteCreate({
      ...registerDto,
      password: hashedPassword,
      role: UserRoles.User
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async loginUser(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user role is User
    if (user.role !== UserRoles.User) {
      throw new UnauthorizedException('Invalid credentials for user login');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async loginAdmin(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user role is Admin
    if (user.role !== UserRoles.Admin) {
      throw new UnauthorizedException('Invalid credentials for admin login');
    }

    // Generate JWT token with admin config
    const token = this.generateAdminToken(user.id, user.email, user.role);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  private generateToken(userId: string, email: string, role: UserRoles): string {
    const payload = {
      sub: userId,
      email,
      role
    };
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions);
  }

  private generateAdminToken(userId: string, email: string, role: UserRoles): string {
    const payload = {
      sub: userId,
      email,
      role
    };
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.adminExpiresIn } as jwt.SignOptions);
  }
}