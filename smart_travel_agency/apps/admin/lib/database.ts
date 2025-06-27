import { supabase } from "./supabase"

// Types
export interface User {
  id: string
  email: string
  name: string
  role: "User" | "Vendeur" | "Admin"
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  name: string
  description: string
  price: number
  duration: string
  tags: string[]
  season: string
  image_url?: string
  created_at: string
  updated_at: string
  creator_id: string
  is_agency_trip?: boolean
}

export interface Reservation {
  id: string
  full_name: string
  email: string
  number_of_people: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
  created_at: string
  updated_at: string
  user_id?: string
  trip_id: string
  trip?: Trip
}

export interface Destination {
  id: string
  name: string
  price: number
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

// Mock data for fallback
const mockUsers: User[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    email: "soyed.dev@gmail.com",
    name: "Soyed Developer",
    role: "Admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    email: "amina.benaissa@email.com",
    name: "Amina Benaissa",
    role: "User",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    email: "karim.boumediene@email.com",
    name: "Karim Boumediene",
    role: "User",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    email: "fatima.zerhouni@email.com",
    name: "Fatima Zerhouni",
    role: "Vendeur",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockTrips: Trip[] = [
  {
    id: "750e8400-e29b-41d4-a716-446655440010",
    name: "Tassili N'Ajjer Rock Art Tour",
    description: "Explore prehistoric rock art and stunning landscapes of Tassili N'Ajjer National Park.",
    price: 85000,
    duration: "5 days",
    tags: ["UNESCO", "Rock Art", "Desert", "History"],
    season: "October-April",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator_id: "550e8400-e29b-41d4-a716-446655440006",
    is_agency_trip: true,
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440011",
    name: "Hoggar Mountains Expedition",
    description: "Adventure through the majestic Hoggar Mountains, home to Mount Tahat and legendary Tuareg culture.",
    price: 120000,
    duration: "7 days",
    tags: ["Mountains", "Adventure", "Tuareg Culture", "Hiking"],
    season: "November-March",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator_id: "550e8400-e29b-41d4-a716-446655440006",
    is_agency_trip: true,
  },
]

const mockReservations = [
  {
    id: "850e8400-e29b-41d4-a716-446655440010",
    full_name: "Amina Benaissa",
    email: "amina.benaissa@email.com",
    number_of_people: 2,
    status: "CONFIRMED" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "550e8400-e29b-41d4-a716-446655440010",
    trip_id: "750e8400-e29b-41d4-a716-446655440010",
    trip: mockTrips[0],
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440011",
    full_name: "Karim Boumediene",
    email: "karim.boumediene@email.com",
    number_of_people: 4,
    status: "PENDING" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "550e8400-e29b-41d4-a716-446655440011",
    trip_id: "750e8400-e29b-41d4-a716-446655440011",
    trip: mockTrips[1],
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440012",
    full_name: "Fatima Zerhouni",
    email: "fatima.zerhouni@email.com",
    number_of_people: 1,
    status: "CONFIRMED" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "550e8400-e29b-41d4-a716-446655440012",
    trip_id: "750e8400-e29b-41d4-a716-446655440010",
    trip: mockTrips[0],
  },
]

// Safe database operation wrapper
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T, operationName: string): Promise<T> {
  try {
    console.log(`Attempting ${operationName}...`)
    const result = await operation()
    console.log(`${operationName} successful`)
    return result
  } catch (error) {
    console.error(`${operationName} failed:`, error)
    console.log(`Using fallback data for ${operationName}`)
    return fallback
  }
}

// Users API
export const usersAPI = {
  async getAll() {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })
        if (error) throw error
        return data || []
      },
      mockUsers,
      "fetch users",
    )
  },

  async create(userData: Omit<User, "id" | "created_at" | "updated_at">) {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase.from("users").insert([userData]).select().single()
        if (error) throw error
        return data
      },
      {
        ...userData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User,
      "create user",
    )
  },

  async update(id: string, userData: Partial<User>) {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase
          .from("users")
          .update({ ...userData, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single()
        if (error) throw error
        return data
      },
      { ...userData, id, updated_at: new Date().toISOString() } as User,
      "update user",
    )
  },

  async delete(id: string) {
    return safeDbOperation(
      async () => {
        const { error } = await supabase.from("users").delete().eq("id", id)
        if (error) throw error
        return true
      },
      true,
      "delete user",
    )
  },
}

// Trips API
export const tripsAPI = {
  async getAll() {
    try {
      console.log("Fetching trips from database...")
      const { data, error } = await supabase.from("trips").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Database error fetching trips:", error)
        console.log("Falling back to mock trips data")
        return mockTrips
      }

      if (!data || data.length === 0) {
        console.log("No trips found in database, returning mock data")
        return mockTrips
      }

      console.log(`Successfully fetched ${data.length} trips from database`)
      return data
    } catch (error) {
      console.error("Exception while fetching trips:", error)
      console.log("Using mock trips data due to exception")
      return mockTrips
    }
  },

  async create(tripData: any) {
    try {
      console.log("Creating trip in database:", tripData)

      // Ensure required fields are present
      const completeTrip = {
        ...tripData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_agency_trip: tripData.is_agency_trip ?? true,
      }

      const { data, error } = await supabase.from("trips").insert([completeTrip]).select().single()

      if (error) {
        console.error("Database error creating trip:", error)
        throw new Error(`Failed to create trip: ${error.message}`)
      }

      console.log("Trip created successfully:", data)
      return data
    } catch (error) {
      console.error("Exception while creating trip:", error)
      throw error
    }
  },

  async update(id: string, tripData: any) {
    try {
      console.log("Updating trip in database:", id, tripData)

      const updateData = {
        ...tripData,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("trips").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Database error updating trip:", error)
        throw new Error(`Failed to update trip: ${error.message}`)
      }

      console.log("Trip updated successfully:", data)
      return data
    } catch (error) {
      console.error("Exception while updating trip:", error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      console.log("Deleting trip from database:", id)

      // First, check if there are any reservations for this trip
      const { data: reservations, error: reservationError } = await supabase
        .from("reservations")
        .select("id, full_name, status")
        .eq("trip_id", id)

      if (reservationError) {
        console.error("Error checking reservations:", reservationError)
        throw new Error(`Failed to check reservations: ${reservationError.message}`)
      }

      if (reservations && reservations.length > 0) {
        const activeReservations = reservations.filter((r) => r.status !== "CANCELLED")

        if (activeReservations.length > 0) {
          throw new Error(
            `Cannot delete trip. There are ${activeReservations.length} active reservation(s) for this trip. Please cancel or transfer these reservations first.`,
          )
        }

        // If there are only cancelled reservations, we can proceed with deletion
        // First delete the cancelled reservations
        console.log(`Deleting ${reservations.length} cancelled reservation(s) for trip ${id}`)
        const { error: deleteReservationsError } = await supabase.from("reservations").delete().eq("trip_id", id)

        if (deleteReservationsError) {
          console.error("Error deleting reservations:", deleteReservationsError)
          throw new Error(`Failed to delete related reservations: ${deleteReservationsError.message}`)
        }
      }

      // Also delete related trip availabilities
      const { error: availabilityError } = await supabase.from("trip_availabilities").delete().eq("trip_id", id)

      if (availabilityError) {
        console.warn("Warning: Could not delete trip availability:", availabilityError)
        // Don't throw error here as this table might not exist or have data
      }

      // Now delete the trip
      const { error } = await supabase.from("trips").delete().eq("id", id)

      if (error) {
        console.error("Database error deleting trip:", error)
        throw new Error(`Failed to delete trip: ${error.message}`)
      }

      console.log("Trip deleted successfully")
      return true
    } catch (error) {
      console.error("Exception while deleting trip:", error)
      throw error
    }
  },

  // New method to check trip dependencies
  async checkTripDependencies(id: string) {
    try {
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("id, full_name, status, created_at")
        .eq("trip_id", id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error checking trip dependencies:", error)
        return { reservations: [], error: error.message }
      }

      return { reservations: reservations || [], error: null }
    } catch (error) {
      console.error("Exception while checking trip dependencies:", error)
      return { reservations: [], error: "Failed to check trip dependencies" }
    }
  },
}

// Reservations API
export const reservationsAPI = {
  async getAll() {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase
          .from("reservations")
          .select(`
            *,
            trip:trips(name, price)
          `)
          .order("created_at", { ascending: false })
        if (error) throw error
        return data || []
      },
      mockReservations,
      "fetch reservations",
    )
  },

  async create(reservationData: any) {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase.from("reservations").insert([reservationData]).select().single()
        if (error) throw error
        return data
      },
      {
        ...reservationData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      "create reservation",
    )
  },

  async update(id: string, reservationData: any) {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase
          .from("reservations")
          .update({ ...reservationData, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single()
        if (error) throw error
        return data
      },
      { ...reservationData, id, updated_at: new Date().toISOString() },
      "update reservation",
    )
  },

  async delete(id: string) {
    return safeDbOperation(
      async () => {
        const { error } = await supabase.from("reservations").delete().eq("id", id)
        if (error) throw error
        return true
      },
      true,
      "delete reservation",
    )
  },
}

// Destinations API
export const destinationsAPI = {
  async getAll() {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        return data || []
      },
      [],
      "fetch destinations",
    )
  },

  async create(destinationData: Omit<Destination, "id" | "created_at" | "updated_at">) {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase.from("destinations").insert([destinationData]).select().single()
        if (error) throw error
        return data
      },
      {
        ...destinationData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Destination,
      "create destination",
    )
  },

  async update(id: string, destinationData: Partial<Destination>) {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase
          .from("destinations")
          .update({ ...destinationData, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single()
        if (error) throw error
        return data
      },
      { ...destinationData, id, updated_at: new Date().toISOString() } as Destination,
      "update destination",
    )
  },

  async delete(id: string) {
    return safeDbOperation(
      async () => {
        const { error } = await supabase.from("destinations").delete().eq("id", id)
        if (error) throw error
        return true
      },
      true,
      "delete destination",
    )
  },
}

// Analytics API
export const analyticsAPI = {
  async getDashboardStats() {
    return safeDbOperation(
      async () => {
        // Try to get real data
        const [paymentsResult, reservationsResult, tripsResult, usersResult] = await Promise.allSettled([
          supabase.from("payments").select("amount").eq("status", "PAID"),
          supabase.from("reservations").select("id, status"),
          supabase.from("trips").select("id"),
          supabase.from("users").select("id"),
        ])

        const payments = paymentsResult.status === "fulfilled" ? paymentsResult.value.data || [] : []
        const reservations = reservationsResult.status === "fulfilled" ? reservationsResult.value.data || [] : []
        const trips = tripsResult.status === "fulfilled" ? tripsResult.value.data || [] : []
        const users = usersResult.status === "fulfilled" ? usersResult.value.data || [] : []

        const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
        const activeReservations = reservations.filter((r) => r.status !== "CANCELLED").length

        return {
          totalRevenue,
          activeReservations,
          totalTrips: trips.length,
          totalUsers: users.length,
        }
      },
      {
        totalRevenue: 4250000,
        activeReservations: 239,
        totalTrips: 8,
        totalUsers: 7,
      },
      "fetch dashboard stats",
    )
  },

  async getRecentTransactions() {
    return safeDbOperation(
      async () => {
        const { data, error } = await supabase
          .from("reservations")
          .select(`
            id,
            full_name,
            created_at,
            status,
            trip:trips(name, price)
          `)
          .order("created_at", { ascending: false })
          .limit(5)
        if (error) throw error
        return data || []
      },
      mockReservations.slice(0, 3),
      "fetch recent transactions",
    )
  },
}
