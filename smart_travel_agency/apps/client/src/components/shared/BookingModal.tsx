"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trip, BookingCalculation } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface BookingModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ trip, isOpen, onClose }: BookingModalProps) {
  const { convertCredits } = useCurrency();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const calculation: BookingCalculation = {
    tripCost: trip?.price || 1250,
    taxes: Math.round((trip?.price || 1250) * 0.15),
    discount: Math.round((trip?.price || 1250) * 0.05),
    totalCost: 0,
  };

  calculation.totalCost =
    calculation.tripCost + calculation.taxes - calculation.discount;

  useEffect(() => {
    if (isOpen && trip) {
      setIsCalculating(true);
      setCalculationStep(0);
      setShowSuccess(false);

      const steps = [
        "Calculating base price...",
        "Adding taxes and fees...",
        "Applying discounts...",
        "Finalizing total...",
      ];

      steps.forEach((_, index) => {
        setTimeout(() => {
          setCalculationStep(index + 1);
          if (index === steps.length - 1) {
            setTimeout(() => setIsCalculating(false), 500);
          }
        }, (index + 1) * 600);
      });
    }
  }, [isOpen, trip]);

  const handleBooking = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md">
        {showSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600">
                Get ready for an amazing journey to {trip?.title}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">{trip?.image}</div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-blue-700 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold mb-1">
                Book Your Adventure
              </h3>
              <p className="text-blue-100">
                {trip?.title || "Amazing Journey"}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {isCalculating ? (
                <div className="space-y-6 py-6">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900">
                      {calculationStep === 0 && "Calculating base price..."}
                      {calculationStep === 1 && "Adding taxes and fees..."}
                      {calculationStep === 2 && "Applying discounts..."}
                      {calculationStep === 3 && "Finalizing total..."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Trip Cost:</span>
                      <span className="font-semibold text-gray-900">
                        {convertCredits(calculation.tripCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Taxes & Fees:</span>
                      <span className="font-semibold text-gray-900">
                        {convertCredits(calculation.taxes)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-green-600">
                      <span>Early Bird Discount:</span>
                      <span className="font-semibold">
                        -{convertCredits(calculation.discount)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {convertCredits(calculation.totalCost)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        All-inclusive pricing
                      </p>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="text-center text-sm text-gray-600 bg-gray-50 p-3">
                    Secure payment • Full refund within 24h
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1 h-10 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBooking}
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {convertCredits(calculation.totalCost)}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
