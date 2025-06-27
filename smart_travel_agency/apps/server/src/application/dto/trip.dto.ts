import { IsString, IsInt, IsOptional, IsUUID, IsArray, IsNotEmpty, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// For retrieving trips (includes ID)
export class TripDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  price: number;

  @IsString()
  duration: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  season: string;
  
  // Add the missing field
  itinaries: any;

  @IsString()
  @IsOptional()
  imageUrl?: string;
  
  @IsString()
  @IsOptional()
  imagePublicId?: string;

  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @IsBoolean()
  @IsOptional()
  isAgencyTrip?: boolean;
}

// For creating new trips (excludes ID)
export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // If already an array, return it
    if (Array.isArray(value)) {
      return value;
    }
    
    // If it's a string that looks like JSON array
    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          return JSON.parse(value);
        } catch (e) {
          // If parsing fails, try comma-separated approach
        }
      }
      
      // Handle comma-separated string
      return value.split(',').map(item => item.trim());
    }
    
    // Return empty array as fallback
    return [];
  })
  tags: string[];

  @IsString()
  @IsNotEmpty()
  season: string;
  
  // Add the missing field
  @Transform(({ value }) => {
    // If already a valid object, return it
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    
    // If it's a string that looks like JSON
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If parsing fails, return a default object
        return { default: "No itinerary details provided" };
      }
    }
    
    // Return default object as fallback
    return { default: "No itinerary details provided" };
  })
  itinaries: any;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

// For updating existing trips (excludes ID)
export class UpdateTripDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    // If already an array, return it
    if (Array.isArray(value)) {
      return value;
    }
    
    // If it's a string that looks like JSON array
    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          return JSON.parse(value);
        } catch (e) {
          // If parsing fails, use comma-separated approach
        }
      }
      
      // Handle comma-separated string
      return value.split(',').map(item => item.trim());
    }
    
    // Return empty array as fallback
    return [];
  })
  tags?: string[];

  @IsString()
  @IsOptional()
  season?: string;
  
  @IsOptional()
  @Transform(({ value }) => {
    // If already a valid object, return it
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    
    // If it's a string that looks like JSON
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If parsing fails, return a default object
        return { default: "No itinerary details provided" };
      }
    }
    
    // Return default object as fallback
    return { default: "No itinerary details provided" };
  })
  itinaries?: any;

  @IsString()
  @IsOptional()
  shareableLink?: string;
}