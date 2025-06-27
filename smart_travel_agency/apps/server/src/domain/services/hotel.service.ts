import { Injectable, NotFoundException } from "@nestjs/common";
import { HotelRepository } from "@infrastructure/repository/hotel.repository";
import { Hotel } from "@prisma/client";
import { CreateHotelDto, UpdateHotelDto } from "@application/dto/hotel.dto";
import { CloudinaryService } from "@infrastructure/cloudinary/cloudinary.service";

@Injectable()
export class HotelService {
    constructor(
        private readonly hotelRepository: HotelRepository,
        private readonly cloudinaryService: CloudinaryService
    ) {}
    
    async createHotel(hotelData: CreateHotelDto): Promise<Hotel> {
        // If price is string, convert to number
        if (typeof hotelData.price === 'string') {
            hotelData.price = parseInt(hotelData.price, 10);
        }
        
        // If stars is string, convert to number
        if (typeof hotelData.stars === 'string') {
            hotelData.stars = parseInt(hotelData.stars, 10);
        }
        
        // If activities is a string, convert to array
        if (typeof hotelData.activities === 'string') {
            try {
                // Handle case when activities is a JSON string
                const activitiesStr = hotelData.activities as string;
                if (activitiesStr.startsWith('[') && activitiesStr.endsWith(']')) {
                    hotelData.activities = JSON.parse(activitiesStr);
                } 
                // Handle case when activities is a comma-separated string
                else {
                    hotelData.activities = activitiesStr.split(',').map(activity => activity.trim());
                }
            } catch (error) {
                // If parsing fails, convert to array with single item
                hotelData.activities = [hotelData.activities as unknown as string];
            }
        }
        
        return this.hotelRepository.executeCreate(hotelData);
    }
    
    async findAllHotels(): Promise<Hotel[]> {
        return this.hotelRepository.executeFind();
    }
    
    async findOneHotel(id: string): Promise<Hotel> {
        const hotel = await this.hotelRepository.executeFindOne(id);
        if (!hotel) {
            throw new NotFoundException(`Hotel with ID ${id} not found`);
        }
        return hotel;
    }
    
    async updateHotel(id: string, hotelData: UpdateHotelDto): Promise<Hotel> {
        // Check if hotel exists
        await this.findOneHotel(id);
        
        // If price is string, convert to number
        if (typeof hotelData.price === 'string') {
            hotelData.price = parseInt(hotelData.price, 10);
        }
        
        // If stars is string, convert to number
        if (typeof hotelData.stars === 'string') {
            hotelData.stars = parseInt(hotelData.stars, 10);
        }
        
        // If activities is a string, convert to array
        if (typeof hotelData.activities === 'string') {
            try {
                // Handle case when activities is a JSON string
                const activitiesStr = hotelData.activities as string;
                if (activitiesStr.startsWith('[') && activitiesStr.endsWith(']')) {
                    hotelData.activities = JSON.parse(activitiesStr);
                } 
                // Handle case when activities is a comma-separated string
                else {
                    hotelData.activities = activitiesStr.split(',').map(activity => activity.trim());
                }
            } catch (error) {
                // If parsing fails, convert to array with single item
                hotelData.activities = [hotelData.activities as unknown as string];
            }
        }
        
        return this.hotelRepository.executeUpdate(id, hotelData);
    }
    
    async deleteHotel(id: string): Promise<Hotel> {
        // Check if hotel exists
        await this.findOneHotel(id);
        
        return this.hotelRepository.executeDelete(id);
    }
    
    async uploadImage(id: string, file: Express.Multer.File): Promise<Hotel> {
        // Check if hotel exists
        const hotel = await this.findOneHotel(id);
        
        // If hotel already has an image, delete it from Cloudinary
        if (hotel.imagePublicId) {
            try {
                await this.cloudinaryService.deleteImage(hotel.imagePublicId);
            } catch (error) {
                console.error('Failed to delete old image:', error);
            }
        }
        
        // Upload new image
        const result = await this.cloudinaryService.uploadImage(file, 'hotels');
        
        // Update hotel with new image URL
        return this.hotelRepository.executeUpdateImage(id, {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id
        });
    }
    
    async createHotelWithImage(hotelData: CreateHotelDto, file?: Express.Multer.File): Promise<Hotel> {
        // First create the hotel
        const hotel = await this.createHotel(hotelData);
        
        // If there's an image file, upload it and update the hotel
        if (file) {
            return this.uploadImage(hotel.id, file);
        }
        
        return hotel;
    }
}