"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { BookingModal } from "@/components/shared/BookingModal";
import { Trip } from "@/types";
import { useAuth } from "@/contexts/authContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface BookingContextType {
  selectedTrip: Trip | null;
  showBookingModal: boolean;
  handleTripSelect: (trip: Trip) => void;
  closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Commented out to avoid TypeScript errors - not currently used
// export const useBooking = () => {
//   const context = useContext(BookingContext);
//   if (!context) {
//     throw new Error("useBooking must be used within a BookingProvider");
//   }
//   return context;
// };

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state } = useAuth();

  // Use the authenticated user from auth context
  const user = state.user;

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedTrip(null);
  };

  const bookingContextValue: BookingContextType = {
    selectedTrip,
    showBookingModal,
    handleTripSelect,
    closeBookingModal,
  };

  return (
    <ProtectedRoute>
      <BookingContext.Provider value={bookingContextValue}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Hidden on mobile by default */}
          <div
            className={`${
              isMobileMenuOpen ? "block" : "hidden"
            } fixed inset-y-0 left-0 z-50 w-64 lg:relative lg:contents lg:bg-background`}
          >
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            {user && (
              <Header
                user={user}
                onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            )}

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-background">
              <div className="p-6 max-w-7xl mx-auto">{children}</div>
            </main>
          </div>

          {/* Mobile menu backdrop */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Booking Modal */}
          <BookingModal
            trip={selectedTrip}
            isOpen={showBookingModal}
            onClose={closeBookingModal}
          />
        </div>
      </BookingContext.Provider>
    </ProtectedRoute>
  );
}
