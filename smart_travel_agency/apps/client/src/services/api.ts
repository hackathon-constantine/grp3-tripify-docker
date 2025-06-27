import { Trip, Reservation, CreateReservationDto } from "@/types/backend";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Trips API
export const getTrips = async (): Promise<Trip[]> => {
  const response = await fetch(`${API_BASE_URL}/trips`);
  if (!response.ok) throw new Error('Failed to fetch trips');
  return response.json();
};

export const getTripById = async (id: string): Promise<Trip> => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`);
  if (!response.ok) throw new Error('Failed to fetch trip');
  return response.json();
};

// Reservations API
export const createReservation = async (data: CreateReservationDto): Promise<Reservation> => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create reservation');
  return response.json();
};

export const uploadReservationImage = async (reservationId: string, file: File): Promise<Reservation> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/image`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
};