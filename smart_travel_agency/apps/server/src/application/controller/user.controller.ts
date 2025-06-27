import { Controller, Get, Post, Body, UseInterceptors, Res, HttpStatus, Req } from '@nestjs/common';
import { CreateUserDto } from "@application/dto/user.dto";
import { LoggingInterceptor } from "@application/interceptors/logging.interceptor";
import { ResponseHandler } from "@application/interfaces/response";
import { Context, LoggerService } from "@domain/services/logger.service";
import { UserService } from "@domain/services/User.service";
import { Roles } from "@application/decorators/role.decorator";
import { UserRoles } from '@prisma/client';


@Controller()
@UseInterceptors(LoggingInterceptor)
export class UserController {
    private Log: LoggerService = new LoggerService('UserController');
    
    constructor(
        private readonly userService: UserService,
        private readonly responseHandler: ResponseHandler
    ) {}

    @Get('/hello')
    async hello() {
        const context : Context = {
            module: 'UserController',
            method: 'hello'
        };
        this.Log.logger('Hello World!', context);
        return 'Hello World!';
    }

    @Post('/create')
    async createUser(@Body() user: CreateUserDto ) {
        const context: Context = {
            module: 'UserController',
            method: 'createUser'
        };
        this.Log.logger('Creating user', context);
        const createdUser = await this.userService.createUser(user);
        this.Log.logger('User created successfully', context);
        return ResponseHandler.success(createdUser, 'User created successfully', 'success', HttpStatus.CREATED);
    }

    @Get('/find')
    async findUser(@Res() res) {
        const context: Context = {
            module: 'UserController',
            method: 'findUser'
        };
        this.Log.logger('Finding user', context);
        const users = await this.userService.findUser();
        this.Log.logger('Users found successfully', context);
        return ResponseHandler.success(users, 'Users found successfully', 'success', HttpStatus.OK);
    }

    @Get('/admin/users')
    @Roles(UserRoles.Admin) // This makes the endpoint admin-only
    async getAllUsers() {
        const context: Context = {
            module: 'UserController',
            method: 'getAllUsers'
        };
        
        this.Log.logger('Admin requesting all users', context);
        const users = await this.userService.findAllUsers();
        this.Log.logger('All users retrieved successfully', context);
        
        return ResponseHandler.success(
            users, 
            'Users retrieved successfully', 
            'success', 
            HttpStatus.OK
        );
    }
}