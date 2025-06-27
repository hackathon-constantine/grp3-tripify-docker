import { IsEmail, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '@prisma/client';

export class CreateReservationDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number) // This transforms the input string to number before validation
  number_of_people: number;

  @IsUUID()
  tripId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  promoCodeId?: string;

  @IsOptional()
  @IsString()
  status?: ReservationStatus;

  // Don't include imageUrl and imagePublicId in the DTO
  // as they will be handled by the file upload process
}

export class ReservationResponseDto {
  id: string;
  full_name: string;
  email: string;
  number_of_people: number;
  status: ReservationStatus;
  userId?: string;
  tripId: string;
  promoCodeId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}