import { Injectable, NotFoundException } from "@nestjs/common";
import { DestinationRepository } from "@infrastructure/repository/destination.repository";
import { Destination } from "@prisma/client";
import { CreateDestinationDto, UpdateDestinationDto } from "@application/dto/destination.dto";
import { CloudinaryService } from "@infrastructure/cloudinary/cloudinary.service";

@Injectable()
export class DestinationService {
    constructor(
        private readonly destinationRepository: DestinationRepository,
        private readonly cloudinaryService: CloudinaryService
    ) {}
    
    async createDestination(destinationData: CreateDestinationDto): Promise<Destination> {
        // If price is string, convert to number
        if (typeof destinationData.price === 'string') {
            destinationData.price = parseInt(destinationData.price, 10);
        }
        
        return this.destinationRepository.executeCreate(destinationData);
    }
    
    async findAllDestinations(): Promise<Destination[]> {
        return this.destinationRepository.executeFind();
    }
    
    async findOneDestination(id: string): Promise<Destination> {
        const destination = await this.destinationRepository.executeFindOne(id);
        if (!destination) {
            throw new NotFoundException(`Destination with ID ${id} not found`);
        }
        return destination;
    }
    
    async updateDestination(id: string, destinationData: UpdateDestinationDto): Promise<Destination> {
        // Check if destination exists
        await this.findOneDestination(id);
        
        // If price is string, convert to number
        if (typeof destinationData.price === 'string') {
            destinationData.price = parseInt(destinationData.price, 10);
        }
        
        return this.destinationRepository.executeUpdate(id, destinationData);
    }
    
    async deleteDestination(id: string): Promise<Destination> {
        // Check if destination exists
        await this.findOneDestination(id);
        
        return this.destinationRepository.executeDelete(id);
    }
    
    async uploadImage(id: string, file: Express.Multer.File): Promise<Destination> {
        // Check if destination exists
        const destination = await this.findOneDestination(id);
        
        // If destination already has an image, delete it from Cloudinary
        if (destination.imagePublicId) {
            try {
                await this.cloudinaryService.deleteImage(destination.imagePublicId);
            } catch (error) {
                console.error('Failed to delete old image:', error);
            }
        }
        
        // Upload new image
        const result = await this.cloudinaryService.uploadImage(file, 'destinations');
        
        // Update destination with new image URL
        return this.destinationRepository.executeUpdateImage(id, {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id
        });
    }
    
    async createDestinationWithImage(destinationData: CreateDestinationDto, file?: Express.Multer.File): Promise<Destination> {
        // First create the destination
        const destination = await this.createDestination(destinationData);
        
        // If there's an image file, upload it and update the destination
        if (file) {
            return this.uploadImage(destination.id, file);
        }
        
        return destination;
    }
}