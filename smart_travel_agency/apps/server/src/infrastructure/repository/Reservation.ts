import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import { Reservation } from "@prisma/client";
import { CreateReservationDto } from "@application/dto/reservation.dto";

@Injectable()
export class ReservationRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}
    
    /**
     * Creates a new reservation in the database
     */
    async excuteCreate(reservationData: any): Promise<Reservation> {
        return this.prisma.reservation.create({
            data: reservationData,
        });
    }
    
    /**
     * Finds all reservations in the database
     */
    async excuteFind(): Promise<Reservation[]> {
        return this.prisma.reservation.findMany();
    }
    
    /**
     * Finds a reservation by its ID
     */
    async excuteFindOne(id: string): Promise<Reservation | null> {
        return this.prisma.reservation.findUnique({
            where: { id },
        });
    }
    
    /**
     * Deletes a reservation by its ID
     */
    async excuteDelete(id: string): Promise<Reservation> {
        return this.prisma.reservation.delete({
            where: { id },
        });
    }

    /**
     * Updates reservation image URL
     */
    async excuteUpdateImage(id: string, imageData: { imageUrl: string, imagePublicId: string }): Promise<Reservation> {
        return this.prisma.reservation.update({
            where: { id },
            data: {
                imageUrl: imageData.imageUrl,
                imagePublicId: imageData.imagePublicId
            }
        });
    }
}