import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    // Handle both password and password_hash
    if (createUserDto.password && !createUserDto.password_hash) {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password_hash = hashedPassword;
      delete createUserDto.password;
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  /**
   * Assign default role (employee) to new user
   */
  async assignDefaultRole(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    // Find or create 'employee' role
    let employeeRole = await this.rolesRepository.findOne({
      where: { name: 'employee' },
    });

    if (!employeeRole) {
      // Create employee role if it doesn't exist
      employeeRole = this.rolesRepository.create({
        name: 'employee',
        description: 'Default employee role',
      });
      await this.rolesRepository.save(employeeRole);
    }

    // Assign role to user
    if (!user.roles) {
      user.roles = [];
    }
    
    // Check if user already has this role
    const hasRole = user.roles.some(role => role.id === employeeRole.id);
    if (!hasRole) {
      user.roles.push(employeeRole);
      await this.usersRepository.save(user);
    }

    return this.findOne(userId);
  }

  /**
   * Assign roles to user
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.findOne(userId);
    const roles = await this.rolesRepository.findByIds(roleIds);

    user.roles = roles;
    await this.usersRepository.save(user);

    return this.findOne(userId);
  }
}
