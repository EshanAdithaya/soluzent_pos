import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee } from '../database/entities';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;
    const loginStartTime = Date.now();
    
    console.log(`🔐 Login attempt for username: ${username} at ${new Date().toISOString()}`);

    const employee = await this.employeeRepository.findOne({
      where: { username, isActive: true },
    });

    if (!employee) {
      console.warn(`❌ Failed login attempt - User not found: ${username}`);
      console.warn(`🕐 Login attempt duration: ${Date.now() - loginStartTime}ms`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      console.warn(`❌ Failed login attempt - Invalid password for user: ${username} (ID: ${employee.id})`);
      console.warn(`🕐 Login attempt duration: ${Date.now() - loginStartTime}ms`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: employee.id,
      username: employee.username,
      role: employee.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    const loginDuration = Date.now() - loginStartTime;
    console.log(`✅ Successful login for ${username} (ID: ${employee.id}, Role: ${employee.role})`);
    console.log(`🕐 Login process completed in ${loginDuration}ms`);
    console.log(`🎫 JWT token generated with expiry: 24 hours`);

    return {
      accessToken,
      tokenType: 'bearer',
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      user: UserProfileDto.fromEmployee(employee),
    };
  }

  async getProfile(employeeId: string): Promise<UserProfileDto> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, isActive: true },
    });

    if (!employee) {
      throw new UnauthorizedException('Employee not found');
    }

    return UserProfileDto.fromEmployee(employee);
  }

  async validateEmployee(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, isActive: true },
    });

    if (!employee) {
      throw new UnauthorizedException('Employee not found or inactive');
    }

    return employee;
  }
}