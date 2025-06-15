import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee, EmployeeRole } from '../database/entities';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const { username, email, password, ...employeeData } = createEmployeeDto;

    const existingEmployee = await this.employeeRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingEmployee) {
      if (existingEmployee.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingEmployee.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = this.employeeRepository.create({
      username,
      email,
      password: hashedPassword,
      ...employeeData,
    });

    const savedEmployee = await this.employeeRepository.save(employee);
    return EmployeeResponseDto.fromEmployee(savedEmployee);
  }

  async findAll(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.find({
      order: { createdAt: 'DESC' },
    });

    return employees.map(EmployeeResponseDto.fromEmployee);
  }

  async findOne(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return EmployeeResponseDto.fromEmployee(employee);
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (updateEmployeeDto.username || updateEmployeeDto.email) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: [
          { username: updateEmployeeDto.username },
          { email: updateEmployeeDto.email },
        ],
      });

      if (existingEmployee && existingEmployee.id !== id) {
        if (existingEmployee.username === updateEmployeeDto.username) {
          throw new ConflictException('Username already exists');
        }
        if (existingEmployee.email === updateEmployeeDto.email) {
          throw new ConflictException('Email already exists');
        }
      }
    }

    Object.assign(employee, updateEmployeeDto);
    const updatedEmployee = await this.employeeRepository.save(employee);

    return EmployeeResponseDto.fromEmployee(updatedEmployee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.role === EmployeeRole.MANAGER) {
      const managerCount = await this.employeeRepository.count({
        where: { role: EmployeeRole.MANAGER, isActive: true },
      });

      if (managerCount <= 1) {
        throw new BadRequestException('Cannot delete the last active manager');
      }
    }

    employee.isActive = false;
    await this.employeeRepository.save(employee);
  }

  async toggleStatus(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.role === EmployeeRole.MANAGER && employee.isActive) {
      const activeManagerCount = await this.employeeRepository.count({
        where: { role: EmployeeRole.MANAGER, isActive: true },
      });

      if (activeManagerCount <= 1) {
        throw new BadRequestException('Cannot deactivate the last active manager');
      }
    }

    employee.isActive = !employee.isActive;
    const updatedEmployee = await this.employeeRepository.save(employee);

    return EmployeeResponseDto.fromEmployee(updatedEmployee);
  }

  async getActiveEmployees(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.find({
      where: { isActive: true },
      order: { firstName: 'ASC' },
    });

    return employees.map(EmployeeResponseDto.fromEmployee);
  }

  async getEmployeesByRole(role: EmployeeRole): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.find({
      where: { role, isActive: true },
      order: { firstName: 'ASC' },
    });

    return employees.map(EmployeeResponseDto.fromEmployee);
  }
}