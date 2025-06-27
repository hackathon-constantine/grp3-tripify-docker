import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import { User } from "@prisma/client";
import { CreateUserDto } from "@application/dto/user.dto";
import { UserDto } from "@application/dto/user.dto";
import { UserRoles } from "@prisma/client";


@Injectable()
export class UserRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}
    
    /**
     * Creates a new user in the database
     */
    async excuteCreate(userData: any): Promise<User> {
        // Set default role as User if not provided
        if (!userData.role) {
            userData.role = UserRoles.User;
        }
        
        return this.prisma.user.create({
            data: userData,
        });
    }
    
    /**
     * Finds all users in the database
     */
    async excuteFind(): Promise<User[]> {
        return this.prisma.user.findMany();
    }
    
    /**
     * Finds a user by their ID
     */
    async excuteFindOne(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    
    /**
     * Finds a user by their email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    
    /**
     * Deletes a user by their ID
     */
    async excuteDelete(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Find all users
     */
    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }
}
