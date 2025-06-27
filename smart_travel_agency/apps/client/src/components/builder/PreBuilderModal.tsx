// src/components/builder/PreBuilderModal.tsx
import React, { useState, FC } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/useT";

// Define the structure for the preferences we're collecting
export interface ItineraryPreferences {
  budget?: number;
  interests: string[];
  duration?: number;
  startDate?: string;
  travelStyle: "budget" | "standard" | "premium" | "luxury";
}

interface PreBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    destination: string;
    startDate: string;
    duration: number;
    interests: string[];
  }) => void;
}

const PreBuilderModal: FC<PreBuilderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [preferences, setPreferences] = useState<ItineraryPreferences>({
    interests: [],
    travelStyle: "standard",
  });

  const interestOptions = [
    {
      id: "adventure",
      label: t("builder.modal.interests.adventure"),
      icon: "🏔️",
    },
    { id: "culture", label: t("builder.modal.interests.culture"), icon: "🏛️" },
    { id: "food", label: t("builder.modal.interests.food"), icon: "🍽️" },
    { id: "nature", label: t("builder.modal.interests.nature"), icon: "🌲" },
    { id: "history", label: t("builder.modal.interests.history"), icon: "📜" },
    { id: "beaches", label: t("builder.modal.interests.beaches"), icon: "🏖️" },
    {
      id: "nightlife",
      label: t("builder.modal.interests.nightlife"),
      icon: "🌃",
    },
    {
      id: "shopping",
      label: t("builder.modal.interests.shopping"),
      icon: "🛍️",
    },
  ];

  const travelStyles = [
    {
      id: "budget",
      name: t("builder.modal.travelStyles.budget.name"),
      description: t("builder.modal.travelStyles.budget.description"),
      icon: "🎒",
    },
    {
      id: "standard",
      name: t("builder.modal.travelStyles.standard.name"),
      description: t("builder.modal.travelStyles.standard.description"),
      icon: "🧳",
    },
    {
      id: "premium",
      name: t("builder.modal.travelStyles.premium.name"),
      description: t("builder.modal.travelStyles.premium.description"),
      icon: "✈️",
    },
    {
      id: "luxury",
      name: t("builder.modal.travelStyles.luxury.name"),
      description: t("builder.modal.travelStyles.luxury.description"),
      icon: "👑",
    },
  ];

  const handleInterestToggle = (interest: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = () => {
    if (preferences.interests.length === 0) {
      alert(t("builder.modal.validation.selectInterest"));
      return;
    }
    onSubmit({
      destination: "",
      startDate: preferences.startDate || "",
      duration: preferences.duration || 7,
      interests: preferences.interests,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {t("builder.modal.title")}
            </h2>
            <p className="text-gray-600">{t("builder.modal.subtitle")}</p>
          </div>

          {/* Travel Style */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("builder.modal.travelStyleHeader")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {travelStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      travelStyle: style.id as any,
                    }))
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    preferences.travelStyle === style.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{style.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {style.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {style.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("builder.modal.interestsHeader")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    preferences.interests.includes(interest.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{interest.icon}</div>
                  <div className="text-sm font-medium text-gray-800">
                    {interest.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("builder.modal.budgetLabel")}
              </label>
              <input
                type="number"
                placeholder={t("builder.modal.budgetPlaceholder")}
                value={preferences.budget || ""}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    budget: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("builder.modal.durationLabel")}
              </label>
              <input
                type="number"
                placeholder={t("builder.modal.durationPlaceholder")}
                min="1"
                max="30"
                value={preferences.duration || ""}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    duration: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("builder.modal.startDateLabel")}
            </label>
            <input
              type="date"
              value={preferences.startDate || ""}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("builder.modal.startBuildingButton")}
            </button>
            <button
              onClick={() =>
                onSubmit({
                  destination: "",
                  startDate: "",
                  duration: 7,
                  interests: ["cultural"],
                })
              }
              className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              {t("builder.modal.skipButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreBuilderModal;
