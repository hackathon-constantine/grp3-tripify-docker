export enum UserRoles {
  User = "User",
  Vendeur = "Vendeur",
  Admin = "Admin"
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRoles;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  tags: string[];
  season: string;
  itinaries: any;
  imageUrl?: string;
  imagePublicId?: string;
  creatorId: string;
  isAgencyTrip: boolean;
  shareableLink?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

export interface Destination {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt: string;
  updatedAt: string;
  weatherData?: Weather;
}

export interface Weather {
  id: string;
  destinationId: string;
  temperature: number;
  condition: string;
  humidity: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  price: number;
  destinationId?: string;
  stars?: number;
  description?: string;
  activities: string[];
  imageUrl?: string;
  imagePublicId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

export interface Reservation {
  id: string;
  full_name: string;
  email: string;
  number_of_people: number;
  status: ReservationStatus;
  userId?: string;
  tripId: string;
  promoCodeId?: string;
  imagePublicId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  trip?: Trip;
  user?: User;
  payment?: Payment;
}

export interface CreateReservationDto {
  full_name: string;
  email: string;
  number_of_people: number;
  tripId: string;
  promoCodeId?: string;
}

export interface Payment {
  id: string;
  amount: number;
  reservationId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}