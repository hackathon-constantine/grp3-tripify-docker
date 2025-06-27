import { Controller, Post, Body, Get, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe, BadRequestException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoggingInterceptor } from "@application/interceptors/logging.interceptor";
import { ResponseHandler } from "@application/interfaces/response";
import { Context, LoggerService } from "@domain/services/logger.service";
import { ReservationService } from "@domain/services/reservation.service";
import { CreateReservationDto } from "@application/dto/reservation.dto";

@Controller('reservations')
@UseInterceptors(LoggingInterceptor)
export class ReservationController {
    private Log: LoggerService = new LoggerService('ReservationController');
    
    constructor(
        private readonly reservationService: ReservationService
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async createReservation(
        @Body() reservationData: CreateReservationDto,
        @Body('number_of_people', ParseIntPipe) number_of_people: number,
        @UploadedFile() file?: Express.Multer.File
    ) {
        // Override the value in the DTO
        reservationData.number_of_people = number_of_people;
        
        const context: Context = {
            module: 'ReservationController',
            method: 'createReservation'
        };
        this.Log.logger('Creating reservation with image', context);
        
        const createdReservation = await this.reservationService.createReservationWithImage(reservationData, file);
        
        this.Log.logger('Reservation created successfully with image', context);
        return ResponseHandler.success(
            createdReservation, 
            'Reservation created successfully', 
            'success', 
            HttpStatus.CREATED
        );
    }

    @Get()
    async findAllReservations() {
        const context: Context = {
            module: 'ReservationController',
            method: 'findAllReservations'
        };
        this.Log.logger('Finding all reservations', context);
        const reservations = await this.reservationService.findReservations();
        this.Log.logger('Reservations found successfully', context);
        return ResponseHandler.success(reservations, 'Reservations found successfully', 'success', HttpStatus.OK);
    }

    @Get(':id')
    async findOneReservation(@Param('id') id: string) {
        const context: Context = {
            module: 'ReservationController',
            method: 'findOneReservation'
        };
        this.Log.logger(`Finding reservation with ID: ${id}`, context);
        const reservation = await this.reservationService.findOneReservation(id);
        this.Log.logger('Reservation found successfully', context);
        return ResponseHandler.success(reservation, 'Reservation found successfully', 'success', HttpStatus.OK);
    }

    @Post(':id/image')
    @UseInterceptors(FileInterceptor('image', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    async uploadReservationImage(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        
        const context: Context = {
            module: 'ReservationController',
            method: 'uploadReservationImage'
        };
        
        this.Log.logger(`Uploading image for reservation ID: ${id}`, context);
        const result = await this.reservationService.uploadImage(id, file);
        this.Log.logger('Image uploaded successfully', context);
        
        return ResponseHandler.success(
            result, 
            'Image uploaded successfully', 
            'success', 
            HttpStatus.OK
        );
    }
    
    @Delete(':id')
    async deleteReservation(@Param('id') id: string) {
        const context: Context = {
            module: 'ReservationController',
            method: 'deleteReservation'
        };
        this.Log.logger(`Deleting reservation with ID: ${id}`, context);
        const reservation = await this.reservationService.deleteReservation(id);
        this.Log.logger('Reservation deleted successfully', context);
        return ResponseHandler.success(reservation, 'Reservation deleted successfully', 'success', HttpStatus.OK);
    }
}