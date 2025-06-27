"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Coins, Zap, Star, Crown, Gem } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useAuth } from "@/contexts/authContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CreditsPage() {
  const t = useT();
  const { state } = useAuth();
  const { convertCredits, getCurrencyLabel } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  // Get current balance from user context, default to 0 if not available
  const currentBalance = state.user?.credit || 0;

  const creditPackages = [
    {
      id: "starter",
      name: t("credits.packages.starter.name"),
      credits: 1000,
      price: 9.99,
      popular: false,
      icon: Coins,
      description: t("credits.packages.starter.description"),
    },
    {
      id: "pro",
      name: t("credits.packages.pro.name"),
      credits: 5000,
      price: 39.99,
      popular: true,
      icon: Zap,
      description: t("credits.packages.pro.description"),
      bonus: t("credits.packages.pro.bonus"),
    },
    {
      id: "premium",
      name: t("credits.packages.premium.name"),
      credits: 12000,
      price: 89.99,
      popular: false,
      icon: Crown,
      description: t("credits.packages.premium.description"),
      bonus: t("credits.packages.premium.bonus"),
    },
    {
      id: "enterprise",
      name: t("credits.packages.enterprise.name"),
      credits: 25000,
      price: 179.99,
      popular: false,
      icon: Gem,
      description: t("credits.packages.enterprise.description"),
      bonus: t("credits.packages.enterprise.bonus"),
    },
  ];
  const public_url: string = "http://localhost:3001/"; 

  const handlePurchase = async (packageId: string) => {
    try {
      setIsLoading(true);
      const slectedamount =
        creditPackages.find((pkg) => pkg.id === packageId)?.credits || 0;
      const reponse = await axios.post(`${public_url}payment/checkout`, {
        amount: slectedamount,
      });
      console.log(reponse.data.data);
      console.log(reponse.data.data.data.attributes.form_url);
      window.location.href = reponse.data.data.data.attributes.form_url;
    } catch (error) {
      console.error("Error processing purchase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const usagePercentage = Math.max(0, 100 - (currentBalance / 2000) * 100);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          {t("credits.title")}
        </h1>
        <p className="text-gray-600">{t("credits.subtitle")}</p>
      </div>

      {/* Current Balance Card */}
      <Card className="mb-8 bg-white">
        <h2 className="flex items-center gap-2 text-gray-900">
          <Coins className="h-5 w-5 text-blue-600" />
          {t("credits.currentBalance.title")}
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-blue-600">
              {convertCredits(currentBalance)}
            </div>
            <div className="text-sm text-gray-600">
              {t("credits.currentBalance.available")} ({getCurrencyLabel()})
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              {t("credits.currentBalance.usage")}
            </div>
            <Progress
              value={usagePercentage}
              className="w-32 bg-gray-200"
              indicatorClassName="bg-blue-600"
            />
            <div className="text-xs text-gray-500 mt-1">
              {usagePercentage.toFixed(0)}% {t("credits.currentBalance.used")}
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">
              {t("credits.currentBalance.todayUsed")}
            </div>
            <div className="text-gray-600">
              {t("credits.currentBalance.todayUsedValue")}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {t("credits.currentBalance.dailyAverage")}
            </div>
            <div className="text-gray-600">
              {t("credits.currentBalance.dailyAverageValue")}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {t("credits.currentBalance.estimatedDays")}
            </div>
            <div className="text-gray-600">
              {t("credits.currentBalance.estimatedDaysValue")}
            </div>
          </div>
        </div>
      </Card>

      {/* Credit Packages */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {t("credits.purchase.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg) => {
            const IconComponent = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className={`relative bg-white ${
                  pkg.popular ? "ring-2 ring-blue-600" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    <Star className="h-3 w-3 mr-1" />
                    {t("credits.purchase.mostPopular")}
                  </Badge>
                )}
                <div className="text-center pb-4">
                  <div className="mx-auto mb-2 p-2 bg-blue-100 rounded-full w-fit">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg text-gray-900">{pkg.name}</h3>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {convertCredits(pkg.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {convertCredits(pkg.credits)}
                    </div>
                    {pkg.bonus && (
                      <Badge
                        variant="secondary"
                        className="mt-2 bg-blue-50 text-blue-600 border-blue-200"
                      >
                        {pkg.bonus}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-4 text-sm text-gray-600">
                    {convertCredits((pkg.price / pkg.credits) * 1000)}{" "}
                    {t("credits.purchase.perThousand")}
                  </div>
                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isLoading}
                    variant={pkg.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    {isLoading
                      ? t("credits.purchase.processing")
                      : t("credits.purchase.purchase")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
