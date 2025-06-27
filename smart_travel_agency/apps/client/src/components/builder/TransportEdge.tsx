// src/components/builder/TransportEdge.tsx
import React, { FC } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import { useT } from "@/hooks/useT";

// Define the data structure we expect on our edge
interface TransportEdgeData {
  transport?: "Flight" | "Train" | "Car";
}

const TransportEdge: FC<EdgeProps<TransportEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const t = useT();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getTransportIcon = (transport: string | undefined) => {
    switch (transport) {
      case "Flight":
        return "✈️";
      case "Train":
        return "🚂";
      case "Car":
        return "🚗";
      default:
        return "—";
    }
  };

  const getTransportLabel = (transport: string | undefined) => {
    switch (transport) {
      case "Flight":
        return t("builder.transport.flight");
      case "Train":
        return t("builder.transport.train");
      case "Car":
        return t("builder.transport.car");
      default:
        return "—";
    }
  };

  return (
    <>
      {/* The BaseEdge component draws the line */}
      <BaseEdge path={edgePath} id={id} />

      {/* EdgeLabelRenderer positions a div in the middle of the edge */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "#F4F4F9",
            padding: "4px 8px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            pointerEvents: "all",
            border: "1px solid #EAEAF2",
          }}
          className="nodrag nopan"
        >
          {getTransportIcon(data?.transport)}{" "}
          {getTransportLabel(data?.transport)}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default TransportEdge;
