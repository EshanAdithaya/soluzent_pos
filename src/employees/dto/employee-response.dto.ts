import { ApiProperty } from '@nestjs/swagger';
import { Employee, EmployeeRole } from '../../database/entities';

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Employee unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Employee username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'john.doe@company.com',
  })
  email: string;

  @ApiProperty({
    description: 'Employee first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Employee full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Employee role',
    enum: EmployeeRole,
    example: EmployeeRole.CASHIER,
  })
  role: EmployeeRole;

  @ApiProperty({
    description: 'Employee active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Employee creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Employee last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  static fromEmployee(employee: Employee): EmployeeResponseDto {
    return {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName,
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }
}