import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmployeeRole } from '../database/entities';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Create new employee',
    description: 'Create a new employee account (Manager only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Username or email already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - Manager role required',
  })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Get all employees',
    description: 'Retrieve all employees with optional filtering (Manager only)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: EmployeeRole,
    description: 'Filter employees by role',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter employees by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: [EmployeeResponseDto],
  })
  async findAll(
    @Query('role') role?: EmployeeRole,
    @Query('active') active?: boolean,
  ): Promise<EmployeeResponseDto[]> {
    if (role) {
      return this.employeesService.getEmployeesByRole(role);
    }
    
    if (active === true) {
      return this.employeesService.getActiveEmployees();
    }

    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Get employee by ID',
    description: 'Retrieve a specific employee by their ID (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Update employee',
    description: 'Update employee information (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Username or email already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete employee',
    description: 'Deactivate employee account (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Employee deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete the last active manager',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Toggle employee status',
    description: 'Activate or deactivate employee account (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee status toggled successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot deactivate the last active manager',
  })
  async toggleStatus(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return this.employeesService.toggleStatus(id);
  }
}