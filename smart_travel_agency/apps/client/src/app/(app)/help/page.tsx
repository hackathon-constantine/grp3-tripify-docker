"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Book,
  CreditCard,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useT } from "@/hooks/useT";
import { useCurrency, Currency, CURRENCY_LABELS } from "@/contexts/CurrencyContext";

const HelpPage = () => {
  const t = useT();
  const { currency, setCurrency } = useCurrency();

  const faqs = [
    {
      icon: Book,
      question: t("help.faq.questions.howToBook.question"),
      answer: t("help.faq.questions.howToBook.answer"),
    },
    {
      icon: CreditCard,
      question: t("help.faq.questions.paymentOptions.question"),
      answer: t("help.faq.questions.paymentOptions.answer"),
    },
    {
      icon: MapPin,
      question: t("help.faq.questions.customizeItinerary.question"),
      answer: t("help.faq.questions.customizeItinerary.answer"),
    },
    {
      icon: HelpCircle,
      question: t("help.faq.questions.whatsIncluded.question"),
      answer: t("help.faq.questions.whatsIncluded.answer"),
    },
    {
      icon: Clock,
      question: t("help.faq.questions.cancelModify.question"),
      answer: t("help.faq.questions.cancelModify.answer"),
    },
    {
      icon: MessageCircle,
      question: t("help.faq.questions.contactGuide.question"),
      answer: t("help.faq.questions.contactGuide.answer"),
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: t("help.contact.liveChat.title"),
      description: t("help.contact.liveChat.description"),
      details: t("help.contact.liveChat.details"),
      action: t("help.contact.liveChat.action"),
      primary: true,
    },
    {
      icon: Phone,
      title: t("help.contact.phone.title"),
      description: t("help.contact.phone.description"),
      details: t("help.contact.phone.details"),
      action: t("help.contact.phone.action"),
      primary: false,
    },
    {
      icon: Mail,
      title: t("help.contact.email.title"),
      description: t("help.contact.email.description"),
      details: t("help.contact.email.details"),
      action: t("help.contact.email.action"),
      primary: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("help.title")}
            </h1>
            <p className="text-gray-600">{t("help.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Currency Selector */}
      <Card className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Currency Preference
              </h3>
              <p className="text-gray-600">
                Choose how you want to view your credits and pricing
              </p>
            </div>
          </div>
          <div className="w-48">
            <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="border-blue-200 p-4 flex flex-row items-center gap-4 justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t("help.needHelp.title")}
          </h3>
          <p className="text-gray-600">{t("help.needHelp.subtitle")}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("help.needHelp.button")}
        </Button>
      </Card>

      {/* FAQ Section */}
      <Card className="bg-white">
        <h3 className="flex items-center space-x-2">
          <Book className="w-5 h-5 text-blue-600" />
          <span>{t("help.faq.title")}</span>
        </h3>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="space-y-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <faq.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      {faq.question}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Contact Methods */}
      <Card className="bg-white">
        <h3>{t("help.contact.title")}</h3>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`text-center p-6 border rounded-lg hover:bg-gray-50 transition-colors ${
                  method.primary ? "border-blue-200 bg-blue-50" : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    method.primary ? "bg-blue-600" : "bg-blue-100"
                  }`}
                >
                  <method.icon
                    className={`w-6 h-6 ${
                      method.primary ? "text-white" : "text-blue-600"
                    }`}
                  />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {method.title}
                </h4>
                <p className="text-sm text-gray-900 font-medium mb-1">
                  {method.description}
                </p>
                <p className="text-xs text-gray-500 mb-4">{method.details}</p>
                <Button
                  variant={method.primary ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {method.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Support Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white gap-2">
          <h3 className="text-lg font-semibold">
            {t("help.resources.guidelines.title")}
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("help.resources.guidelines.booking.title")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("help.resources.guidelines.booking.description")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("help.resources.guidelines.requirements.title")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("help.resources.guidelines.requirements.description")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white gap-2">
          <h3 className="text-lg font-semibold">
            {t("help.resources.policies.title")}
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("help.resources.policies.cancellation.title")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("help.resources.policies.cancellation.description")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("help.resources.policies.privacy.title")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("help.resources.policies.privacy.description")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
