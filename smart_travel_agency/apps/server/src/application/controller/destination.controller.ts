import { 
    Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, 
    HttpStatus, UploadedFile, ParseUUIDPipe, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoggingInterceptor } from "@application/interceptors/logging.interceptor";
import { ResponseHandler } from "@application/interfaces/response";
import { Context, LoggerService } from "@domain/services/logger.service";
import { DestinationService } from "@domain/services/destination.service";
import { CreateDestinationDto, UpdateDestinationDto } from "@application/dto/destination.dto";
import { Roles } from "@application/decorators/role.decorator";
import { UserRoles } from '@prisma/client';

@Controller('destinations')
@UseInterceptors(LoggingInterceptor)
export class DestinationController {
    private Log: LoggerService = new LoggerService('DestinationController');
    
    constructor(
        private readonly destinationService: DestinationService
    ) {}

    @Post()
    @Roles(UserRoles.Admin)
    @UseInterceptors(FileInterceptor('image', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (!file || !file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    async createDestination(
        @Body() destinationData: CreateDestinationDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const context: Context = {
            module: 'DestinationController',
            method: 'createDestination'
        };
        this.Log.logger('Creating destination with image', context);
        
        const createdDestination = await this.destinationService.createDestinationWithImage(destinationData, file);
        
        this.Log.logger('Destination created successfully with image', context);
        return ResponseHandler.success(
            createdDestination, 
            'Destination created successfully', 
            'success', 
            HttpStatus.CREATED
        );
    }

    @Get()
    async findAllDestinations() {
        const context: Context = {
            module: 'DestinationController',
            method: 'findAllDestinations'
        };
        this.Log.logger('Finding all destinations', context);
        const destinations = await this.destinationService.findAllDestinations();
        this.Log.logger('Destinations found successfully', context);
        return ResponseHandler.success(destinations, 'Destinations found successfully', 'success', HttpStatus.OK);
    }

    @Get(':id')
    async findOneDestination(@Param('id') id: string) {
        const context: Context = {
            module: 'DestinationController',
            method: 'findOneDestination'
        };
        this.Log.logger(`Finding destination with ID: ${id}`, context);
        const destination = await this.destinationService.findOneDestination(id);
        this.Log.logger('Destination found successfully', context);
        return ResponseHandler.success(destination, 'Destination found successfully', 'success', HttpStatus.OK);
    }

    @Patch(':id')
    @Roles(UserRoles.Admin)
    async updateDestination(@Param('id') id: string, @Body() destinationData: UpdateDestinationDto) {
        const context: Context = {
            module: 'DestinationController',
            method: 'updateDestination'
        };
        this.Log.logger(`Updating destination with ID: ${id}`, context);
        const destination = await this.destinationService.updateDestination(id, destinationData);
        this.Log.logger('Destination updated successfully', context);
        return ResponseHandler.success(destination, 'Destination updated successfully', 'success', HttpStatus.OK);
    }

    @Delete(':id')
    @Roles(UserRoles.Admin)
    async deleteDestination(@Param('id') id: string) {
        const context: Context = {
            module: 'DestinationController',
            method: 'deleteDestination'
        };
        this.Log.logger(`Deleting destination with ID: ${id}`, context);
        const destination = await this.destinationService.deleteDestination(id);
        this.Log.logger('Destination deleted successfully', context);
        return ResponseHandler.success(destination, 'Destination deleted successfully', 'success', HttpStatus.OK);
    }

    @Post(':id/image')
    @Roles(UserRoles.Admin)
    @UseInterceptors(FileInterceptor('image', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    async uploadDestinationImage(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        
        const context: Context = {
            module: 'DestinationController',
            method: 'uploadDestinationImage'
        };
        
        this.Log.logger(`Uploading image for destination ID: ${id}`, context);
        const result = await this.destinationService.uploadImage(id, file);
        this.Log.logger('Image uploaded successfully', context);
        
        return ResponseHandler.success(result, 'Image uploaded successfully', 'success', HttpStatus.OK);
    }
}