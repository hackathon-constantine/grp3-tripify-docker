import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import { Hotel } from "@prisma/client";
import { CreateHotelDto, UpdateHotelDto } from "@application/dto/hotel.dto";

@Injectable()
export class HotelRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}
    
    /**
     * Creates a new hotel in the database
     */
    async executeCreate(hotelData: CreateHotelDto): Promise<Hotel> {
        return this.prisma.hotel.create({
            data: hotelData,
        });
    }
    
    /**
     * Finds all hotels in the database
     */
    async executeFind(): Promise<Hotel[]> {
        return this.prisma.hotel.findMany();
    }
    
    /**
     * Finds a hotel by its ID
     */
    async executeFindOne(id: string): Promise<Hotel | null> {
        return this.prisma.hotel.findUnique({
            where: { id },
        });
    }
    
    /**
     * Updates a hotel by its ID
     */
    async executeUpdate(id: string, hotelData: UpdateHotelDto): Promise<Hotel> {
        return this.prisma.hotel.update({
            where: { id },
            data: hotelData,
        });
    }
    
    /**
     * Deletes a hotel by its ID
     */
    async executeDelete(id: string): Promise<Hotel> {
        return this.prisma.hotel.delete({
            where: { id },
        });
    }
    
    /**
     * Updates hotel image URL
     */
    async executeUpdateImage(id: string, imageData: { imageUrl: string, imagePublicId: string }): Promise<Hotel> {
        return this.prisma.hotel.update({
            where: { id },
            data: {
                imageUrl: imageData.imageUrl,
                imagePublicId: imageData.imagePublicId
            }
        });
    }
}