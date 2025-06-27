import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import { Destination } from "@prisma/client";
import { CreateDestinationDto, UpdateDestinationDto } from "@application/dto/destination.dto";

@Injectable()
export class DestinationRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}
    
    /**
     * Creates a new destination in the database
     */
    async executeCreate(destinationData: CreateDestinationDto): Promise<Destination> {
        return this.prisma.destination.create({
            data: destinationData,
        });
    }
    
    /**
     * Finds all destinations in the database
     */
    async executeFind(): Promise<Destination[]> {
        return this.prisma.destination.findMany({
            include: {
                weatherData: true
            }
        });
    }
    
    /**
     * Finds a destination by its ID
     */
    async executeFindOne(id: string): Promise<Destination | null> {
        return this.prisma.destination.findUnique({
            where: { id },
            include: {
                weatherData: true
            }
        });
    }
    
    /**
     * Updates a destination by its ID
     */
    async executeUpdate(id: string, destinationData: UpdateDestinationDto): Promise<Destination> {
        return this.prisma.destination.update({
            where: { id },
            data: destinationData,
        });
    }
    
    /**
     * Deletes a destination by its ID
     */
    async executeDelete(id: string): Promise<Destination> {
        return this.prisma.destination.delete({
            where: { id },
        });
    }
    
    /**
     * Updates destination image URL
     */
    async executeUpdateImage(id: string, imageData: { imageUrl: string, imagePublicId: string }): Promise<Destination> {
        return this.prisma.destination.update({
            where: { id },
            data: {
                imageUrl: imageData.imageUrl,
                imagePublicId: imageData.imagePublicId
            }
        });
    }
}