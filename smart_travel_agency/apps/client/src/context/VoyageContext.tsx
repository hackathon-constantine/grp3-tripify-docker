"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface VoyageEvent {
  id: string;
  date: string;
  time: string;
  type: "departure" | "arrival" | "activity" | "hotel" | "transport";
  title: string;
  subtitle: string;
  location?: string;
  voyageId: string;
  voyageName: string;
}

interface Voyage {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  events: VoyageEvent[];
}

interface VoyageContextType {
  voyages: Voyage[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getEventsForDate: (date: string) => VoyageEvent[];
  syncWithGoogleCalendar: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
}

const VoyageContext = createContext<VoyageContextType | undefined>(undefined);

// Mock data - replace with actual API calls
const mockVoyages: Voyage[] = [
  {
    id: "voyage-1",
    name: "Morocco Desert Adventure",
    destination: "Morocco",
    startDate: "2024-03-15",
    endDate: "2024-03-22",
    status: "upcoming",
    events: [
      {
        id: "event-1",
        date: "2024-03-15",
        time: "06:00",
        type: "departure",
        title: "Flight to Casablanca",
        subtitle: "Direct flight from JFK",
        location: "JFK Airport",
        voyageId: "voyage-1",
        voyageName: "Morocco Desert Adventure",
      },
      {
        id: "event-2",
        date: "2024-03-15",
        time: "14:30",
        type: "arrival",
        title: "Arrive in Casablanca",
        subtitle: "Hotel transfer included",
        location: "Mohammed V Airport",
        voyageId: "voyage-1",
        voyageName: "Morocco Desert Adventure",
      },
      {
        id: "event-3",
        date: "2024-03-15",
        time: "19:00",
        type: "activity",
        title: "Welcome Dinner",
        subtitle: "Traditional Moroccan cuisine",
        location: "Hotel Restaurant",
        voyageId: "voyage-1",
        voyageName: "Morocco Desert Adventure",
      },
      {
        id: "event-4",
        date: "2024-03-16",
        time: "09:00",
        type: "activity",
        title: "Medina Tour",
        subtitle: "Guided tour of old city",
        location: "Casablanca Medina",
        voyageId: "voyage-1",
        voyageName: "Morocco Desert Adventure",
      },
      {
        id: "event-5",
        date: "2024-03-17",
        time: "08:00",
        type: "transport",
        title: "Desert Transfer",
        subtitle: "Journey to Sahara Desert",
        location: "Hotel Lobby",
        voyageId: "voyage-1",
        voyageName: "Morocco Desert Adventure",
      },
    ],
  },
  {
    id: "voyage-2",
    name: "Egypt Nile Cruise",
    destination: "Egypt",
    startDate: "2024-06-08",
    endDate: "2024-06-15",
    status: "upcoming",
    events: [
      {
        id: "event-6",
        date: "2024-06-08",
        time: "10:00",
        type: "departure",
        title: "Flight to Cairo",
        subtitle: "Morning departure",
        location: "JFK Airport",
        voyageId: "voyage-2",
        voyageName: "Egypt Nile Cruise",
      },
    ],
  },
];

export function VoyageProvider({ children }: { children: ReactNode }) {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch voyages
    const fetchVoyages = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setVoyages(mockVoyages);
      } catch (error) {
        console.error("Failed to fetch voyages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoyages();
  }, []);

  const getEventsForDate = (date: string): VoyageEvent[] => {
    const allEvents = voyages.flatMap((voyage) => voyage.events);
    return allEvents.filter((event) => event.date === date);
  };

  const syncWithGoogleCalendar = async () => {
    setIsSyncing(true);
    try {
      // Simulate Google Calendar API integration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would integrate with Google Calendar API
      // Example: Create events in Google Calendar
      const eventsToSync = voyages.flatMap((voyage) => voyage.events);

      console.log("Syncing events with Google Calendar:", eventsToSync);

      // Show success message or update UI
      alert("Successfully synced with Google Calendar!");
    } catch (error) {
      console.error("Failed to sync with Google Calendar:", error);
      alert("Failed to sync with Google Calendar. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <VoyageContext.Provider
      value={{
        voyages,
        selectedDate,
        setSelectedDate,
        getEventsForDate,
        syncWithGoogleCalendar,
        isLoading,
        isSyncing,
      }}
    >
      {children}
    </VoyageContext.Provider>
  );
}

export function useVoyage() {
  const context = useContext(VoyageContext);
  if (context === undefined) {
    throw new Error("useVoyage must be used within a VoyageProvider");
  }
  return context;
}
