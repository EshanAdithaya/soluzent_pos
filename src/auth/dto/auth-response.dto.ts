import { ApiProperty } from '@nestjs/swagger';
import { Employee, EmployeeRole } from '../../database/entities';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token type',
    example: 'bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 86400,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'User information',
  })
  user: UserProfileDto;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'manager1',
  })
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'manager@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Employee role',
    enum: EmployeeRole,
    example: EmployeeRole.MANAGER,
  })
  role: EmployeeRole;

  @ApiProperty({
    description: 'Account status',
    example: true,
  })
  isActive: boolean;

  static fromEmployee(employee: Employee): UserProfileDto {
    return {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName,
      role: employee.role,
      isActive: employee.isActive,
    };
  }
}