import { Injectable, NotFoundException } from "@nestjs/common";
import { UserDto } from "@application/dto/user.dto";
import { UserRepository } from "@infrastructure/repository/user.repository";
import { User } from "@prisma/client";
import { CreateUserDto } from "@application/dto/user.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository
    ) {}
    
    async createUser(userDto: CreateUserDto): Promise<User> {
        return await this.userRepository.excuteCreate(userDto);
    }
    
    async findUser(): Promise<User[]> {
        return await this.userRepository.excuteFind();
    }
    
    async findOneUser(id: string): Promise<User> {
        const user = await this.userRepository.excuteFindOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    
    async deleteUser(id: string): Promise<User> {
        const userExists = await this.userRepository.excuteFindOne(id);
        if (!userExists) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return await this.userRepository.excuteDelete(id);
    }

    /**
     * Find all users in the system
     * Admin-only functionality
     */
    async findAllUsers(): Promise<Partial<User>[]> {
        const users = await this.userRepository.findAll();
        
        // Remove sensitive information like passwords
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
}