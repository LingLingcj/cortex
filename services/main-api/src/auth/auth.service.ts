import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly allowedEmails: string[];

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // 从环境变量读取允许的邮箱列表
    const adminEmails = this.configService.get<string>('ADMIN_EMAILS') || '';
    this.allowedEmails = adminEmails.split(',').map(email => email.trim()).filter(email => email);
  }

  async register(createUserDto: CreateUserDto) {
    // 检查邮箱是否在允许列表中
    if (!this.allowedEmails.includes(createUserDto.email)) {
      throw new BadRequestException('Registration is only allowed for admin users');
    }

    // 检查用户是否已存在
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
