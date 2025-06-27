import { 
    Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, 
    HttpStatus, UploadedFile, ParseUUIDPipe, BadRequestException, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoggingInterceptor } from "@application/interceptors/logging.interceptor";
import { ResponseHandler } from "@application/interfaces/response";
import { Context, LoggerService } from "@domain/services/logger.service";
import { HotelService } from "@domain/services/hotel.service";
import { CreateHotelDto, UpdateHotelDto } from "@application/dto/hotel.dto";
import { Roles } from "@application/decorators/role.decorator";
import { UserRoles } from '@prisma/client';

@Controller('hotels')
@UseInterceptors(LoggingInterceptor)
export class HotelController {
    private Log: LoggerService = new LoggerService('HotelController');
    
    constructor(
        private readonly hotelService: HotelService
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
    async createHotel(
        @Body() hotelData: CreateHotelDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const context: Context = {
            module: 'HotelController',
            method: 'createHotel'
        };
        this.Log.logger('Creating hotel with image', context);
        
        const createdHotel = await this.hotelService.createHotelWithImage(hotelData, file);
        
        this.Log.logger('Hotel created successfully with image', context);
        return ResponseHandler.success(
            createdHotel, 
            'Hotel created successfully', 
            'success', 
            HttpStatus.CREATED
        );
    }

    @Get()
    async findAllHotels() {
        const context: Context = {
            module: 'HotelController',
            method: 'findAllHotels'
        };
        this.Log.logger('Finding all hotels', context);
        const hotels = await this.hotelService.findAllHotels();
        this.Log.logger('Hotels found successfully', context);
        return ResponseHandler.success(hotels, 'Hotels found successfully', 'success', HttpStatus.OK);
    }

    @Get(':id')
    async findOneHotel(@Param('id') id: string) {
        const context: Context = {
            module: 'HotelController',
            method: 'findOneHotel'
        };
        this.Log.logger(`Finding hotel with ID: ${id}`, context);
        const hotel = await this.hotelService.findOneHotel(id);
        this.Log.logger('Hotel found successfully', context);
        return ResponseHandler.success(hotel, 'Hotel found successfully', 'success', HttpStatus.OK);
    }

    @Patch(':id')
    @Roles(UserRoles.Admin)
    async updateHotel(@Param('id') id: string, @Body() hotelData: UpdateHotelDto) {
        const context: Context = {
            module: 'HotelController',
            method: 'updateHotel'
        };
        this.Log.logger(`Updating hotel with ID: ${id}`, context);
        const hotel = await this.hotelService.updateHotel(id, hotelData);
        this.Log.logger('Hotel updated successfully', context);
        return ResponseHandler.success(hotel, 'Hotel updated successfully', 'success', HttpStatus.OK);
    }

    @Delete(':id')
    @Roles(UserRoles.Admin)
    async deleteHotel(@Param('id') id: string) {
        const context: Context = {
            module: 'HotelController',
            method: 'deleteHotel'
        };
        this.Log.logger(`Deleting hotel with ID: ${id}`, context);
        const hotel = await this.hotelService.deleteHotel(id);
        this.Log.logger('Hotel deleted successfully', context);
        return ResponseHandler.success(hotel, 'Hotel deleted successfully', 'success', HttpStatus.OK);
    }

    @Post(':id/image')
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
    async uploadHotelImage(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        
        const context: Context = {
            module: 'HotelController',
            method: 'uploadHotelImage'
        };
        
        this.Log.logger(`Uploading image for hotel ID: ${id}`, context);
        const result = await this.hotelService.uploadImage(id, file);
        this.Log.logger('Image uploaded successfully', context);
        
        return ResponseHandler.success(result, 'Image uploaded successfully', 'success', HttpStatus.OK);
    }
}