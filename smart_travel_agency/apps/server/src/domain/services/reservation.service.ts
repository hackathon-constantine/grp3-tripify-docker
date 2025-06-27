import { Injectable, NotFoundException } from "@nestjs/common";
import { ReservationRepository } from "@infrastructure/repository/Reservation";
import { Reservation, ReservationStatus } from "@prisma/client";
import { CreateReservationDto } from "@application/dto/reservation.dto";
import { CloudinaryService } from "@infrastructure/cloudinary/cloudinary.service";

@Injectable()
export class ReservationService {
    constructor(
        private readonly reservationRepository: ReservationRepository,
        private readonly cloudinaryService: CloudinaryService
    ) {}
    
    async createReservation(reservationData: any): Promise<Reservation> {
        return await this.reservationRepository.excuteCreate(reservationData);
    }
    
    async findReservations(): Promise<Reservation[]> {
        return await this.reservationRepository.excuteFind();
    }
    
    async findOneReservation(id: string): Promise<Reservation> {
        const reservation = await this.reservationRepository.excuteFindOne(id);
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }
        return reservation;
    }
    
    async deleteReservation(id: string): Promise<Reservation> {
        const reservationExists = await this.reservationRepository.excuteFindOne(id);
        if (!reservationExists) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }
        return await this.reservationRepository.excuteDelete(id);
    }
    
    /**
     * Creates a new reservation with optional image
     */
    async createReservationWithImage(
        reservationData: CreateReservationDto, 
        file?: Express.Multer.File
    ): Promise<Reservation> {
        // Parse number_of_people from string to number if needed
        if (typeof reservationData.number_of_people === 'string') {
            reservationData.number_of_people = parseInt(reservationData.number_of_people, 10);
        }

        // First create the reservation
        const reservation = await this.reservationRepository.excuteCreate(reservationData);
        
        // If there's an image file, upload it and update the reservation
        if (file) {
            // Upload image to Cloudinary
            const result = await this.cloudinaryService.uploadImage(file, 'reservations');
            
            // Update reservation with image URL
            return this.reservationRepository.excuteUpdateImage(reservation.id, {
                imageUrl: result.secure_url,
                imagePublicId: result.public_id
            });
        }
        
        // Return the reservation without image
        return reservation;
    }
    
    /**
     * Updates a reservation's image
     */
    async uploadImage(id: string, file: Express.Multer.File): Promise<Reservation> {
        // Check if reservation exists
        const reservation = await this.reservationRepository.excuteFindOne(id);
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }
        
        // If reservation already has an image, delete the old one
        if (reservation.imagePublicId) {
            await this.cloudinaryService.deleteImage(reservation.imagePublicId);
        }
        
        // Upload new image
        const result = await this.cloudinaryService.uploadImage(file, 'reservations');
        
        // Update reservation with new image URL
        return this.reservationRepository.excuteUpdateImage(id, {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id
        });
    }
}