"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Filter,
  Search,
  Map,
  ExternalLink,
  Settings,
  Globe,
  X,
  ChevronDown,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingModal } from "./BookingModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Voyage,
  NormalVoyage,
  CustomVoyage,
  Trip,
} from "../../types/voyage";
import Link from "next/link";
import { useT } from "@/hooks/useT";

interface MarketplacePageProps {
  onTripSelect: (trip: Trip) => void;
  onMapView: () => void;
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

interface FilterState {
  priceRange: [number, number];
  duration: string;
  rating: number;
  country: string;
  searchQuery: string;
}

const marketplaceVoyages: Voyage[] = [
  {
    id: "normal-1",
    type: "normal",
    title: "Sahara Desert Expedition",
    author: "Amina Benali",
    price: 890,
    duration: "7 days",
    rating: 4.2,
    image: "🏜️",
    description:
      "Journey deep into Morocco's golden dunes with expert Berber guides, experience authentic desert life, and sleep under star-filled skies in luxury desert camps.",
    reviews: 124,
    destination: {
      name: "Merzouga",
      coordinates: { lat: 31.0801, lng: -4.0133 },
      country: "Tlemcen",
    },
  },
  {
    id: "custom-1",
    type: "custom",
    title: "Tokyo Insider Experience",
    createdBy: "Kenji Nakamura",
    price: 1200,
    duration: "5 days",
    image: "🏯",
    description:
      "Unlock hidden Tokyo through personalized itineraries crafted by local experts. From secret ramen spots to traditional workshops, experience Japan like a true insider.",
    workflowLink: "/workflows/tokyo-custom-builder",
    customData: {
      flexibility: "high",
      themes: ["culture", "food", "technology"],
      "group size": "1-4",
      customization: "full",
    },
    isPrivate: false,
    destination: {
      name: "Tokyo",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      country: "Japan",
    },
  },
  {
    id: "normal-2",
    type: "normal",
    title: "Aurora Borealis Adventure",
    author: "Björn Eriksson",
    price: 1200,
    duration: "5 days",
    rating: 3,
    image: "🌌",
    description:
      "Chase the mystical Northern Lights across Iceland's dramatic landscapes while exploring crystal ice caves, powerful geysers, and volcanic wonders.",
    reviews: 156,
    destination: {
      name: "Reykjavik",
      coordinates: { lat: 64.1466, lng: -21.9426 },
      country: "Iceland",
    },
  },
  {
    id: "custom-2",
    type: "custom",
    title: "Alpine Adventure Tailored",
    createdBy: "Alpine Adventures Co.",
    price: 2200,
    duration: "8 days",
    image: "🏔️",
    description:
      "Scale new heights with a completely personalized Swiss Alps experience. Expert mountain guides adapt every detail to your skill level and adventure dreams.",
    workflowLink: "/workflows/alps-adventure-builder",
    customData: {
      difficulty: "adjustable",
      accommodation: "luxury",
      activities: ["hiking", "climbing"],
      guide: "personal",
    },
    isPrivate: false,
    destination: {
      name: "Zermatt",
      coordinates: { lat: 46.0207, lng: 7.7491 },
      country: "Switzerland",
    },
  },
  {
    id: "normal-3",
    type: "normal",
    title: "Greek Odyssey Island Trail",
    author: "Dimitris Kostas",
    price: 980,
    duration: "9 days",
    rating: 3.8,
    image: "🏛️",
    description:
      "Sail through ancient history across Greece's most stunning islands. Discover hidden archaeological treasures, pristine beaches, and timeless Mediterranean culture.",
    reviews: 142,
    destination: {
      name: "Santorini",
      coordinates: { lat: 36.3932, lng: 25.4615 },
      country: "Greece",
    },
  },
  {
    id: "normal-4",
    type: "normal",
    title: "Patagonia Wilderness Trek",
    author: "Carlos Mendoza",
    price: 1450,
    duration: "10 days",
    rating: 3.4,
    image: "🏔️",
    description:
      "Traverse the breathtaking landscapes of Torres del Paine with expert gaucho guides. Experience pristine glacial lakes, towering granite spires, and encounters with wild guanacos in Earth's last frontier.",
    reviews: 89,
    destination: {
      name: "Torres del Paine",
      coordinates: { lat: -50.9423, lng: -73.4068 },
      country: "Chile",
    },
  },
  {
    id: "normal-5",
    type: "normal",
    title: "Himalayan Base Camp Expedition",
    author: "Pemba Sherpa",
    price: 2100,
    duration: "14 days",
    rating: 5.0,
    image: "⛰️",
    description:
      "Follow ancient trading routes to Everest Base Camp with legendary Sherpa guides. Experience authentic mountain culture, visit sacred monasteries, and witness the world's highest peaks in their full majesty.",
    reviews: 203,
    destination: {
      name: "Everest Base Camp",
      coordinates: { lat: 27.9881, lng: 86.925 },
      country: "Nepal",
    },
  },
  {
    id: "normal-6",
    type: "normal",
    title: "Amazon Rainforest Immersion",
    author: "Ana Santos",
    price: 1150,
    duration: "8 days",
    rating: 4.1,
    image: "🌳",
    description:
      "Discover the world's most biodiverse ecosystem with indigenous guides who've called the Amazon home for generations. Spot rare wildlife, learn traditional survival skills, and contribute to conservation efforts.",
    reviews: 127,
    destination: {
      name: "Manaus",
      coordinates: { lat: -3.119, lng: -60.0217 },
      country: "Brazil",
    },
  },

  {
    id: "custom-3",
    type: "custom",
    title: "Bali Wellness Sanctuary",
    createdBy: "Serenity Wellness Collective",
    price: 850,
    duration: "6 days",
    image: "🌺",
    description:
      "Transform your well-being with a personalized Balinese retreat. Custom spa rituals, private yoga sessions, and healing ceremonies designed for your spiritual journey.",
    workflowLink: "/workflows/bali-wellness-builder",
    customData: {
      focus: ["yoga", "meditation", "spa"],
      intensity: "moderate",
      dietary: "customizable",
      accommodation: "luxury resort",
    },
    isPrivate: false,
    destination: {
      name: "Ubud",
      coordinates: { lat: -8.5069, lng: 115.2625 },
      country: "Indonesia",
    },
  },
  {
    id: "normal-7",
    type: "normal",
    title: "African Safari Adventure",
    author: "Kofi Asante",
    price: 1850,
    duration: "12 days",
    rating: 3.7,
    image: "🦁",
    description:
      "Witness the Great Migration across Kenya's most spectacular national parks with expert Maasai guides. Experience luxury tented camps, incredible wildlife encounters, and authentic cultural exchanges with local communities.",
    reviews: 176,
    destination: {
      name: "Maasai Mara",
      coordinates: { lat: -1.5061, lng: 35.1432 },
      country: "Kenya",
    },
  },
  {
    id: "normal-8",
    type: "normal",
    title: "Atlas Mountains Cultural Trek",
    author: "Youssef Amellal",
    price: 750,
    duration: "6 days",
    rating: 4.6,
    image: "🏔️",
    description:
      "Explore Morocco's High Atlas with Berber mountain guides, staying in traditional kasbahs and experiencing authentic village life. Discover hidden valleys, ancient irrigation systems, and spectacular mountain vistas.",
    reviews: 94,
    destination: {
      name: "High Atlas",
      coordinates: { lat: 31.059, lng: -7.9209 },
      country: "Tlemcen",
    },
  },
  {
    id: "normal-9",
    type: "normal",
    title: "Westfjords Adventure",
    author: "Sigrid Olafsdottir",
    price: 1350,
    duration: "7 days",
    rating: 4.8,
    image: "🌊",
    description:
      "Journey through Iceland's remote Westfjords with expert naturalist guides. Experience dramatic sea cliffs, hidden hot springs, and pristine fjords while staying in cozy guesthouses and spotting Arctic wildlife.",
    reviews: 112,
    destination: {
      name: "Westfjords",
      coordinates: { lat: 65.9315, lng: -23.7118 },
      country: "Iceland",
    },
  },
  {
    id: "normal-10",
    type: "normal",
    title: "Crete Archaeological Journey",
    author: "Nikos Papadakis",
    price: 890,
    duration: "8 days",
    rating: 3.1,
    image: "🏛️",
    description:
      "Uncover the mysteries of Minoan civilization with expert archaeologists. Explore ancient palaces, hidden caves, and traditional villages while learning about Europe's oldest advanced civilization from local historians.",
    reviews: 156,
    destination: {
      name: "Crete",
      coordinates: { lat: 35.2401, lng: 24.8093 },
      country: "Greece",
    },
  },
  {
    id: "normal-11",
    type: "normal",
    title: "Pantanal Wildlife Safari",
    author: "Roberto Silva",
    price: 1280,
    duration: "9 days",
    rating: 4.8,
    image: "🐆",
    description:
      "Discover the world's largest tropical wetland with expert wildlife biologists. Track jaguars, giant otters, and hundreds of bird species while staying in eco-lodges and learning about conservation efforts from local researchers.",
    reviews: 143,
    destination: {
      name: "Pantanal",
      coordinates: { lat: -16.25, lng: -56.6667 },
      country: "Brazil",
    },
  },
  {
    id: "normal-12",
    type: "normal",
    title: "Annapurna Circuit Adventure",
    author: "Tenzin Norbu",
    price: 1650,
    duration: "12 days",
    rating: 4.9,
    image: "🏔️",
    description:
      "Complete the legendary Annapurna Circuit with experienced mountain guides. Cross high-altitude passes, visit remote villages, and experience diverse ecosystems from subtropical forests to alpine meadows in the heart of the Himalayas.",
    reviews: 187,
    destination: {
      name: "Annapurna",
      coordinates: { lat: 28.5969, lng: 83.8201 },
      country: "Nepal",
    },
  },
];

function NormalVoyageCard({
  voyage,
  onBook,
}: {
  voyage: NormalVoyage;
  onBook: () => void;
}) {
  const { convertCredits } = useCurrency();
  
  return (
    <Card className="bg-white transition-all duration-200 border border-gray-200 overflow-hidden">
      <div className="h-40 bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-md">
        <div className="text-4xl">{voyage.image}</div>
        <div className="text-8xl rotate-12 absolute bottom-0 right-0 opacity-15">
          {voyage.image}
        </div>
        {/* <div className="absolute top-3 left-3 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
          Expert-Led
        </div> */}
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                {voyage.title}
              </h3>
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {voyage.rating}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">by {voyage.author}</p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
            {voyage.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{voyage.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{voyage.reviews} reviews</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{voyage.destination.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-gray-900">{convertCredits(voyage.price)}</p>
            <p className="text-sm text-gray-500">per person</p>
          </div>
          <Button
            onClick={onBook}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Reserve Trip
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CustomVoyageCard({
  voyage,
  onBook,
}: {
  voyage: CustomVoyage;
  onBook: () => void;
}) {
  const { convertCredits } = useCurrency();
  
  return (
    <Card className="bg-white transition-all duration-200 border border-gray-200 overflow-hidden relative border-l-4 border-l-blue-500">
      <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center relative overflow-hidden rounded-md">
        <div className="text-4xl">{voyage.image}</div>
        <div className="text-8xl rotate-12 absolute bottom-0 right-0 opacity-15">
          {voyage.image}
        </div>
        <div className="absolute top-3 left-3 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
          Customizable
        </div>
        {voyage.isPrivate && (
          <div className="absolute top-3 right-3 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm font-medium">
            Private
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                {voyage.title}
              </h3>
              <Link
                href={voyage.workflowLink}
                className="py-1 px-2 hover:bg-gray-50 rounded-md"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-gray-600">by {voyage.createdBy}</p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
            {voyage.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(voyage.customData)
            .slice(0, 3)
            .map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 text-gray-700 px-2 py-1 rounded-md text-sm"
              >
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </div>
            ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{voyage.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span>Customizable</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{voyage.destination.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-gray-900">{convertCredits(voyage.price)}</p>
            <p className="text-sm text-gray-500">starting from</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(voyage.workflowLink, "_blank")}
            >
              <Settings className="w-4 h-4 mr-1" />
              Personalize
            </Button>
            <Button
              onClick={onBook}
              className="bg-blue-500 hover:bg-blue-600 shadow-blue-300/15"
            >
              Reserve Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MarketplacePage({
  onTripSelect,
  onMapView,
}: MarketplacePageProps) {
  const t = useT();
  const { convertCredits } = useCurrency();
  const [activeTab, setActiveTab] = useState("all");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 3000],
    duration: "",
    rating: 0,
    country: "",
    searchQuery: "",
  });

  // Get unique countries for filter dropdown
  const countries = useMemo(() => {
    const countrySet = new Set(
      marketplaceVoyages.map((v) => v.destination.country)
    );
    return Array.from(countrySet).sort();
  }, []);

  // Get min/max prices for slider range
  const priceRange = useMemo(() => {
    const prices = marketplaceVoyages.map((v) => v.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, []);

  useEffect(() => {
    setFilters({
      priceRange: [priceRange[0], priceRange[1]],
      duration: "any",
      rating: 0,
      country: "all",
      searchQuery: "",
    });
  }, [priceRange]);

  // Advanced filtering logic
  const filteredVoyages = useMemo(() => {
    return marketplaceVoyages.filter((voyage) => {
      // Search query filter
      const matchesSearch =
        filters.searchQuery === "" ||
        voyage.title
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        voyage.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        voyage.destination.name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        voyage.destination.country
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase());

      // Price range filter
      const matchesPrice =
        voyage.price >= filters.priceRange[0] &&
        voyage.price <= filters.priceRange[1];

      // Country filter
      const matchesCountry =
        filters.country === "all" ||
        voyage.destination.country === filters.country;

      // Duration filter (extract number from duration string)
      const matchesDuration = (() => {
        if (filters.duration === "any") return true;
        const voyageDays = parseInt(voyage.duration);
        switch (filters.duration) {
          case "short":
            return voyageDays <= 3;
          case "medium":
            return voyageDays >= 4 && voyageDays <= 7;
          case "long":
            return voyageDays >= 8;
          default:
            return true;
        }
      })();

      // Rating filter (only for normal voyages)
      const matchesRating = (() => {
        if (filters.rating === 0) return true;
        if (voyage.type === "normal") {
          return voyage.rating >= filters.rating;
        }
        return true; // Custom voyages don't have ratings
      })();

      return (
        matchesSearch &&
        matchesPrice &&
        matchesCountry &&
        matchesDuration &&
        matchesRating
      );
    });
  }, [filters]);

  const handleBookVoyage = (voyage: Voyage) => {
    setSelectedVoyage(voyage);
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = (bookingData: BookingData) => {
    console.log("Booking completed:", bookingData);
    const trip: Trip = {
      id: selectedVoyage!.id,
      name: selectedVoyage!.title,
      destination: selectedVoyage!.destination.name,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(
        Date.now() +
          Number.parseInt(selectedVoyage!.duration) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      price: selectedVoyage!.price,
      status: "upcoming",
    };
    onTripSelect(trip);
  };

  const getVoyagesToShow = () => {
    const filtered = filteredVoyages;
    switch (activeTab) {
      case "normal":
        return filtered.filter((v) => v.type === "normal");
      case "custom":
        return filtered.filter((v) => v.type === "custom");
      default:
        return filtered;
    }
  };

  const handleMapViewClick = () => {
    onMapView();
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [priceRange[0], priceRange[1]],
      duration: "any",
      rating: 0,
      country: "all",
      searchQuery: "",
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.country && filters.country !== "all") count++;
    if (filters.duration && filters.duration !== "any") count++;
    if (filters.rating > 0) count++;
    if (
      filters.priceRange[0] > priceRange[0] ||
      filters.priceRange[1] < priceRange[1]
    )
      count++;
    return count;
  };

  // Price range slider component
  const PriceRangeSlider = () => {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      updateFilter("priceRange", [value, filters.priceRange[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      updateFilter("priceRange", [filters.priceRange[0], value]);
    };

    const minPercent =
      ((filters.priceRange[0] - priceRange[0]) /
        (priceRange[1] - priceRange[0])) *
      100;
    const maxPercent =
      ((filters.priceRange[1] - priceRange[0]) /
        (priceRange[1] - priceRange[0])) *
      100;

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{convertCredits(filters.priceRange[0])}</span>
            <span>{convertCredits(filters.priceRange[1])}</span>
          </div>
          <div className="relative h-2">
            <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
            <div
              className="absolute h-2 bg-blue-500 rounded-lg"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            ></div>
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[0]}
              onChange={handleMinChange}
              className="absolute w-full h-2 opacity-0 cursor-pointer"
              style={{ zIndex: 1 }}
            />
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[1]}
              onChange={handleMaxChange}
              className="absolute w-full h-2 opacity-0 cursor-pointer"
              style={{ zIndex: 2 }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("marketplace.title")}
          </h1>
          <p className="text-gray-600">{t("marketplace.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleMapViewClick}>
            <Map className="w-4 h-4 mr-2" />
            {t("marketplace.exploreMap")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative bg-white rounded-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t("marketplace.search.placeholder")}
            className="pl-10 py-2 border-gray-300"
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="px-4 py-2 border-gray-300  hover:bg-gray-50 relative bg-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("marketplace.filters.advanced")}
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {t("marketplace.filters.title")}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {t("marketplace.filters.resetAll")}
                </Button>
              </div>

              <PriceRangeSlider />

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("marketplace.filters.location")}
                </Label>
                <Select
                  value={filters.country}
                  onValueChange={(value) => updateFilter("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("marketplace.filters.selectCountry")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("marketplace.filters.allCountries")}
                    </SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("marketplace.filters.duration")}
                </Label>
                <Select
                  value={filters.duration}
                  onValueChange={(value) => updateFilter("duration", value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("marketplace.filters.selectDuration")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">
                      {t("marketplace.filters.anyDuration")}
                    </SelectItem>
                    <SelectItem value="short">
                      {t("marketplace.filters.short")}
                    </SelectItem>
                    <SelectItem value="medium">
                      {t("marketplace.filters.medium")}
                    </SelectItem>
                    <SelectItem value="long">
                      {t("marketplace.filters.long")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("marketplace.filters.minimumRating")}
                </Label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) =>
                    updateFilter("rating", parseFloat(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("marketplace.filters.selectRating")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      {t("marketplace.filters.anyRating")}
                    </SelectItem>
                    <SelectItem value="4">
                      {t("marketplace.filters.fourStars")}
                    </SelectItem>
                    <SelectItem value="4.5">
                      {t("marketplace.filters.fourHalfStars")}
                    </SelectItem>
                    <SelectItem value="4.8">
                      {t("marketplace.filters.fourEightStars")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1"
                >
                  {t("marketplace.filters.apply")}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="grid bg-gray-50 w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="all">
              {t("marketplace.tabs.allExperiences")} ({filteredVoyages.length})
            </TabsTrigger>
            <TabsTrigger value="normal">
              {t("marketplace.tabs.expertLed")} (
              {filteredVoyages.filter((v) => v.type === "normal").length})
            </TabsTrigger>
            <TabsTrigger value="custom">
              {t("marketplace.tabs.buildYourOwn")} (
              {filteredVoyages.filter((v) => v.type === "custom").length})
            </TabsTrigger>
          </TabsList>

          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.searchQuery && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                  <span>
                    {t("marketplace.activeFilters.search")}: "
                    {filters.searchQuery}"
                  </span>
                  <button
                    onClick={() => updateFilter("searchQuery", "")}
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.country && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                  <span>
                    {t("marketplace.activeFilters.country")}: {filters.country}
                  </span>
                  <button
                    onClick={() => updateFilter("country", "")}
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.duration && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                  <span>
                    {t("marketplace.activeFilters.duration")}:{" "}
                    {filters.duration}
                  </span>
                  <button
                    onClick={() => updateFilter("duration", "")}
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.rating > 0 && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                  <span>
                    {t("marketplace.activeFilters.rating")}: {filters.rating}+{" "}
                    {t("marketplace.activeFilters.stars")}
                  </span>
                  <button
                    onClick={() => updateFilter("rating", 0)}
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {(filters.priceRange[0] > priceRange[0] ||
                filters.priceRange[1] < priceRange[1]) && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                  <span>
                    {t("marketplace.activeFilters.price")}: {convertCredits(filters.priceRange[0])} - {convertCredits(filters.priceRange[1])}
                  </span>
                  <button
                    onClick={() =>
                      updateFilter("priceRange", [priceRange[0], priceRange[1]])
                    }
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {filteredVoyages.length > 0 && (
            <div className="mb-6 text-sm text-gray-600">
              {t("marketplace.results.showing")} {getVoyagesToShow().length}{" "}
              {t("marketplace.results.of")} {marketplaceVoyages.length}{" "}
              {t("marketplace.results.experiences")}
              {getActiveFilterCount() > 0 && (
                <span className="text-blue-600 ml-1">
                  ({t("marketplace.results.filteredBy")}{" "}
                  {getActiveFilterCount()}{" "}
                  {getActiveFilterCount() === 1
                    ? t("marketplace.results.criteria")
                    : t("marketplace.results.criteria")}
                  )
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {getVoyagesToShow().map((voyage) =>
              voyage.type === "normal" ? (
                <NormalVoyageCard
                  key={voyage.id}
                  voyage={voyage}
                  onBook={() => handleBookVoyage(voyage)}
                />
              ) : (
                <CustomVoyageCard
                  key={voyage.id}
                  voyage={voyage}
                  onBook={() => handleBookVoyage(voyage)}
                />
              )
            )}
          </div>

          {getVoyagesToShow().length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("marketplace.noResults.title")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("marketplace.noResults.description")}
              </p>
              {getActiveFilterCount() > 0 && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  {t("marketplace.noResults.clearFilters")}
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {getVoyagesToShow().length > 0 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="px-6 py-2 border-gray-300 bg-transparent hover:bg-gray-50"
          >
            {t("marketplace.discoverMore")}
          </Button>
        </div>
      )}

      <BookingModal
        voyage={selectedVoyage}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedVoyage(null);
        }}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}
