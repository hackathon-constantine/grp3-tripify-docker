"use client";

import type React from "react";

import { useState } from "react";
import {
  X,
  Upload,
  Users,
  CreditCard,
  Check,
  FileText,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Voyage } from "@/types/voyage";
import { useT } from "@/hooks/useT";

interface BookingModalProps {
  voyage: Voyage | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (bookingData: BookingData) => void;
}

interface BookingData {
  voyageId: string;
  numberOfPeople: number;
  idDocument: File | null;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  specialRequests: string;
  totalAmount: number;
}

type BookingStep = "id-upload" | "people-count" | "payment" | "confirmation";

export function BookingModal({
  voyage,
  isOpen,
  onClose,
  onBookingComplete,
}: BookingModalProps) {
  const t = useT();
  const [currentStep, setCurrentStep] = useState<BookingStep>("id-upload");
  const [bookingData, setBookingData] = useState<BookingData>({
    voyageId: voyage?.id || "",
    numberOfPeople: 1,
    idDocument: null,
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    paymentInfo: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
    specialRequests: "",
    totalAmount: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  if (!isOpen || !voyage) return null;

  const calculateTotal = () => {
    const basePrice = voyage.price * bookingData.numberOfPeople;
    const tax = basePrice * 0.1; // 10% tax
    return basePrice + tax;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBookingData({ ...bookingData, idDocument: file });
      setUploadedFileName(file.name);
    }
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case "id-upload":
        setCurrentStep("people-count");
        break;
      case "people-count":
        setBookingData({ ...bookingData, totalAmount: calculateTotal() });
        setCurrentStep("payment");
        break;
      case "payment":
        handlePayment();
        break;
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep("confirmation");
    setIsProcessing(false);
  };

  const handleBookingComplete = () => {
    onBookingComplete(bookingData);
    onClose();
    // Reset form
    setCurrentStep("id-upload");
    setBookingData({
      voyageId: voyage?.id || "",
      numberOfPeople: 1,
      idDocument: null,
      personalInfo: { firstName: "", lastName: "", email: "", phone: "" },
      paymentInfo: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      },
      specialRequests: "",
      totalAmount: 0,
    });
  };

  const getStepNumber = (step: BookingStep) => {
    const steps = ["id-upload", "people-count", "payment", "confirmation"];
    return steps.indexOf(step) + 1;
  };

  const isStepCompleted = (step: BookingStep) => {
    const currentStepNumber = getStepNumber(currentStep);
    const stepNumber = getStepNumber(step);
    return stepNumber < currentStepNumber;
  };

  const canProceed = () => {
    switch (currentStep) {
      case "id-upload":
        return (
          bookingData.idDocument !== null &&
          bookingData.personalInfo.firstName &&
          bookingData.personalInfo.email
        );
      case "people-count":
        return bookingData.numberOfPeople > 0;
      case "payment":
        return (
          bookingData.paymentInfo.cardNumber &&
          bookingData.paymentInfo.expiryDate &&
          bookingData.paymentInfo.cvv &&
          bookingData.paymentInfo.cardholderName
        );
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <h3 className="text-xl font-semibold">{t("booking.title")}</h3>
            <p className="text-sm text-gray-600 mt-1">{voyage.title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {(
              [
                "id-upload",
                "people-count",
                "payment",
                "confirmation",
              ] as BookingStep[]
            ).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isStepCompleted(step)
                      ? "bg-green-500 text-white"
                      : currentStep === step
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isStepCompleted(step) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === "id-upload" && (
            <div className="space-y-6">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("booking.steps.idUpload.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("booking.steps.idUpload.description")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="id-upload">
                    {t("booking.steps.idUpload.documentLabel")}
                  </Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          {uploadedFileName ? (
                            <span className="font-medium text-green-600">
                              ✓ {uploadedFileName}
                            </span>
                          ) : (
                            <>
                              <span className="font-semibold">
                                {t("booking.steps.idUpload.clickToUpload")}
                              </span>{" "}
                              {t("booking.steps.idUpload.orDragDrop")}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("booking.steps.idUpload.fileTypes")}
                        </p>
                      </div>
                      <input
                        id="id-upload"
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      {t("booking.personalInfo.firstName")}
                    </Label>
                    <Input
                      id="firstName"
                      value={bookingData.personalInfo.firstName}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          personalInfo: {
                            ...bookingData.personalInfo,
                            firstName: e.target.value,
                          },
                        })
                      }
                      placeholder={t(
                        "booking.personalInfo.firstNamePlaceholder"
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      {t("booking.personalInfo.lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      value={bookingData.personalInfo.lastName}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          personalInfo: {
                            ...bookingData.personalInfo,
                            lastName: e.target.value,
                          },
                        })
                      }
                      placeholder={t(
                        "booking.personalInfo.lastNamePlaceholder"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">
                    {t("booking.personalInfo.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingData.personalInfo.email}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        personalInfo: {
                          ...bookingData.personalInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder={t("booking.personalInfo.emailPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    {t("booking.personalInfo.phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingData.personalInfo.phone}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        personalInfo: {
                          ...bookingData.personalInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder={t("booking.personalInfo.phonePlaceholder")}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === "people-count" && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("booking.steps.peopleCount.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("booking.steps.peopleCount.description")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="people-count">
                    {t("booking.steps.peopleCount.label")}
                  </Label>
                  <Select
                    value={bookingData.numberOfPeople.toString()}
                    onValueChange={(value) =>
                      setBookingData({
                        ...bookingData,
                        numberOfPeople: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("booking.steps.peopleCount.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}{" "}
                          {num === 1
                            ? t("booking.steps.peopleCount.person")
                            : t("booking.steps.peopleCount.people")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="special-requests">
                    {t("booking.steps.peopleCount.specialRequests")}
                  </Label>
                  <Textarea
                    id="special-requests"
                    value={bookingData.specialRequests}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        specialRequests: e.target.value,
                      })
                    }
                    placeholder={t(
                      "booking.steps.peopleCount.specialRequestsPlaceholder"
                    )}
                    rows={3}
                  />
                </div>

                {/* Price Breakdown */}
                <Card className="bg-gray-50">
                  <div className="p-4">
                    <h4 className="font-semibold mb-3">
                      {t("booking.priceBreakdown.title")}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>
                          {voyage.title} × {bookingData.numberOfPeople}
                        </span>
                        <span>
                          $
                          {(
                            voyage.price * bookingData.numberOfPeople
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("booking.priceBreakdown.taxesFees")}</span>
                        <span>
                          $
                          {(
                            voyage.price *
                            bookingData.numberOfPeople *
                            0.1
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>{t("booking.priceBreakdown.total")}</span>
                        <span>${calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {currentStep === "payment" && (
            <div className="space-y-6">
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("booking.steps.payment.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("booking.steps.payment.description")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardholder-name">
                    {t("booking.payment.cardholderName")}
                  </Label>
                  <Input
                    id="cardholder-name"
                    value={bookingData.paymentInfo.cardholderName}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        paymentInfo: {
                          ...bookingData.paymentInfo,
                          cardholderName: e.target.value,
                        },
                      })
                    }
                    placeholder={t("booking.payment.cardholderNamePlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="card-number">
                    {t("booking.payment.cardNumber")}
                  </Label>
                  <Input
                    id="card-number"
                    value={bookingData.paymentInfo.cardNumber}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        paymentInfo: {
                          ...bookingData.paymentInfo,
                          cardNumber: e.target.value,
                        },
                      })
                    }
                    placeholder={t("booking.payment.cardNumberPlaceholder")}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry-date">
                      {t("booking.payment.expiryDate")}
                    </Label>
                    <Input
                      id="expiry-date"
                      value={bookingData.paymentInfo.expiryDate}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          paymentInfo: {
                            ...bookingData.paymentInfo,
                            expiryDate: e.target.value,
                          },
                        })
                      }
                      placeholder={t("booking.payment.expiryDatePlaceholder")}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">{t("booking.payment.cvv")}</Label>
                    <Input
                      id="cvv"
                      value={bookingData.paymentInfo.cvv}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          paymentInfo: {
                            ...bookingData.paymentInfo,
                            cvv: e.target.value,
                          },
                        })
                      }
                      placeholder={t("booking.payment.cvvPlaceholder")}
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Final Price */}
                <Card className="bg-blue-50 border-blue-200">
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {t("booking.payment.totalAmount")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {bookingData.numberOfPeople}{" "}
                          {t("booking.payment.travelers")}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        ${bookingData.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{t("booking.payment.securityNote")}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === "confirmation" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  {t("booking.confirmation.title")}
                </h3>
                <p className="text-gray-600">
                  {t("booking.confirmation.subtitle")}
                </p>
              </div>

              <Card className="bg-gray-50 text-left">
                <div className="p-4">
                  <h4 className="font-semibold mb-3">
                    {t("booking.confirmation.detailsTitle")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t("booking.confirmation.voyage")}:</span>
                      <span className="font-medium">{voyage.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("booking.confirmation.travelers")}:</span>
                      <span>
                        {bookingData.numberOfPeople}{" "}
                        {t("booking.confirmation.people")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("booking.confirmation.totalPaid")}:</span>
                      <span className="font-semibold">
                        ${bookingData.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("booking.confirmation.bookingId")}:</span>
                      <span className="font-mono">
                        VB-{Date.now().toString().slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <p className="text-sm text-gray-600">
                {t("booking.confirmation.emailSent")}{" "}
                {bookingData.personalInfo.email}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={
                currentStep === "confirmation"
                  ? onClose
                  : () => setCurrentStep("id-upload")
              }
              disabled={isProcessing}
            >
              {currentStep === "confirmation"
                ? t("booking.buttons.close")
                : t("booking.buttons.back")}
            </Button>

            {currentStep !== "confirmation" && (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("booking.buttons.processing")}
                  </>
                ) : currentStep === "payment" ? (
                  `${t(
                    "booking.buttons.pay"
                  )} $${bookingData.totalAmount.toLocaleString()}`
                ) : (
                  t("booking.buttons.continue")
                )}
              </Button>
            )}

            {currentStep === "confirmation" && (
              <Button
                onClick={handleBookingComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                {t("booking.buttons.completeBooking")}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
