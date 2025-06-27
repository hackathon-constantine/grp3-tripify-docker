import React, { useMemo, useState, FC } from "react";
import { Node } from "reactflow";
import { DestinationNodeData } from "./DestinationNode";
import { Destination, Hotel } from "../../app/builder/page";
import { useT } from "@/hooks/useT";
import { useCurrency } from "@/contexts/CurrencyContext";

interface QuoteCalculatorProps {
  nodes: Node<DestinationNodeData>[];
  destinations: Destination[];
  hotels: Hotel[];
}

const QuoteCalculator: FC<QuoteCalculatorProps> = ({
  nodes,
  destinations,
  hotels,
}) => {
  const t = useT();
  const { convertCredits } = useCurrency();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  const subtotal = useMemo(() => {
    return nodes.reduce((total, node) => {
      if (node.type === "destinationNode" && node.data) {
        const hotelData = hotels.find((h) => h.id === node.data.values.hotel);
        const hotelCost = hotelData?.price || 0;
        const duration = node.data.values.duration || 1;
        return total + hotelCost * duration;
      }
      return total;
    }, 0);
  }, [nodes, hotels]);

  const handleApplyDiscount = () => {
    if (promoCode.toUpperCase() === "SUMMER20") {
      setDiscount(0.2);
      setError("");
      alert(t("builder.quote.promoApplied"));
    } else {
      setDiscount(0);
      setError(t("builder.quote.invalidPromoCode"));
    }
  };

  const finalPrice = subtotal * (1 - discount);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "100px", // Adjusted to be above the buttons
        right: "30px",
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        zIndex: 10,
        border: "1px solid #EAEAF2",
        width: "280px",
      }}
    >
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <div style={{ color: "#8A8B9F", fontSize: "12px" }}>
          {t("builder.quote.subtotal")}
        </div>
        <div style={{ color: "#2A2B3D", fontSize: "18px", fontWeight: "bold" }}>
          {convertCredits(subtotal)}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #EAEAF2", paddingTop: "15px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder={t("builder.quote.promoCode")}
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setError("");
            }}
            style={{
              flexGrow: 1,
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #EAEAF2",
            }}
          />
          <button
            onClick={handleApplyDiscount}
            style={{
              background: "#8A8B9F",
              color: "white",
              border: "none",
              padding: "0 15px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {t("builder.quote.apply")}
          </button>
        </div>
        {error && (
          <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "5px" }}>
            {error}
          </div>
        )}
      </div>

      {discount > 0 && (
        <div
          style={{
            color: "#28a745",
            fontSize: "14px",
            fontWeight: "bold",
            marginTop: "10px",
            textAlign: "right",
          }}
        >
          {t("builder.quote.discount")} ({discount * 100}%): -
          {convertCredits(subtotal * discount)}
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid #EAEAF2",
          marginTop: "10px",
          paddingTop: "10px",
          textAlign: "right",
        }}
      >
        <div style={{ color: "#8A8B9F", fontSize: "12px" }}>
          {t("builder.quote.totalFinal")}
        </div>
        <div style={{ color: "#2A2B3D", fontSize: "28px", fontWeight: "bold" }}>
          {convertCredits(finalPrice)}
        </div>
      </div>
    </div>
  );
};

export default QuoteCalculator;
