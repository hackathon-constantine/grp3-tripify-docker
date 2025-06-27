"use client";

import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
  EdgeTypes,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

import DestinationNode, {
  DestinationNodeData,
} from "@/components/builder/DestinationNode";
import TransportNode, {
  TransportNodeData,
} from "../../components/builder/TransportNode";
import TripHUD from "../../components/builder/TripHUD";
import TransportEdge from "../../components/builder/TransportEdge";
import PreBuilderModal, {
  ItineraryPreferences,
} from "../../components/builder/PreBuilderModal";
import { DestinationPicker } from "../../components/builder/DestinationPicker";

// Define interfaces for our travel data
export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  description: string;
  activities: string[];
  avgStayDays: number;
  bestMonths: string[];
  emoji: string;
  popularity: number;
}

export interface Hotel {
  id: string;
  name: string;
  price: number;
  amenities: string[];
}

export interface Transport {
  id: string;
  name: string;
  basePrice: number;
  duration: string;
  icon: string;
}

const nodeTypes: NodeTypes = {
  destinationNode: DestinationNode,
  transportNode: TransportNode,
};

const edgeTypes: EdgeTypes = {
  transportEdge: TransportEdge,
};

const defaultEdgeOptions = {
  style: { stroke: "#6366f1", strokeWidth: 2 },
  animated: true,
};

const ItineraryBuilderPage = () => {
  const [nodes, setNodes] = useState<
    Node<DestinationNodeData | TransportNodeData>[]
  >([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [transportOptions, setTransportOptions] = useState<Transport[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [destinationPickerState, setDestinationPickerState] = useState<{
    isOpen: boolean;
    nodeId: string | null;
  }>({ isOpen: false, nodeId: null });
  const [tripStartDate, setTripStartDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Reset time to midnight
    return tomorrow;
  });

  // Success message states
  const [shareSuccess, setShareSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Function to calculate cumulative days for date calculations
  const calculateCumulativeDays = useCallback(
    (
      targetNodeId: string,
      allNodes: Node<DestinationNodeData | TransportNodeData>[]
    ) => {
      const destinationNodes = allNodes
        .filter((n) => n.type === "destinationNode")
        .sort((a, b) => {
          const aData = a.data as DestinationNodeData;
          const bData = b.data as DestinationNodeData;
          return aData.sequenceNumber - bData.sequenceNumber;
        });

      let cumulativeDays = 0;
      for (const node of destinationNodes) {
        if (node.id === targetNodeId) {
          return cumulativeDays;
        }
        const nodeData = node.data as DestinationNodeData;
        cumulativeDays += nodeData.values.duration;
      }
      return 0;
    },
    []
  );

  const updateDestinationNodeData = useCallback(
    (nodeId: string, newValues: DestinationNodeData["values"]) => {
      setNodes((nds) => {
        const updatedNodes = nds.map((node) => {
          if (node.id === nodeId && node.type === "destinationNode") {
            return {
              ...node,
              data: {
                ...node.data,
                values: newValues,
              },
            } as Node<DestinationNodeData>;
          }
          return node;
        });

        // Recalculate dates for all destination nodes after any update
        return updatedNodes.map((node) => {
          if (node.type === "destinationNode") {
            const cumulativeDaysBeforeThis = calculateCumulativeDays(
              node.id,
              updatedNodes
            );
            return {
              ...node,
              data: {
                ...node.data,
                tripStartDate,
                cumulativeDaysBeforeThis,
              },
            } as Node<DestinationNodeData>;
          }
          return node;
        });
      });
    },
    [setNodes, calculateCumulativeDays, tripStartDate]
  );

  const updateTransportNodeData = useCallback(
    (nodeId: string, newValues: TransportNodeData["values"]) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.type === "transportNode") {
            return {
              ...node,
              data: {
                ...node.data,
                values: newValues,
              },
            } as Node<TransportNodeData>;
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleOpenDestinationPicker = useCallback((nodeId: string) => {
    setDestinationPickerState({ isOpen: true, nodeId });
  }, []);

  const handleDestinationSelect = useCallback(
    (destinationId: string) => {
      if (destinationPickerState.nodeId) {
        const currentNode = nodes.find(
          (n) => n.id === destinationPickerState.nodeId
        );
        if (currentNode && currentNode.type === "destinationNode") {
          const currentDestinationData =
            currentNode.data as DestinationNodeData;
          const oldDestinationId = currentDestinationData.values.destination;

          // Update the destination node
          updateDestinationNodeData(destinationPickerState.nodeId, {
            ...currentDestinationData.values,
            destination: destinationId,
          });

          // Update connected transport nodes with new destination info
          setNodes((currentNodes) => {
            return currentNodes.map((node) => {
              if (node.type === "transportNode") {
                const transportData = node.data as TransportNodeData;
                let updated = false;
                let newData = { ...transportData };

                // Update fromDestination if this transport node comes from the changed destination
                if (transportData.fromDestination === oldDestinationId) {
                  newData.fromDestination = destinationId;
                  updated = true;
                }

                // Update toDestination if this transport node goes to the changed destination
                if (transportData.toDestination === oldDestinationId) {
                  newData.toDestination = destinationId;
                  updated = true;
                }

                if (updated) {
                  return {
                    ...node,
                    data: newData,
                  } as Node<TransportNodeData>;
                }
              }
              return node;
            });
          });
        }
      }
      setDestinationPickerState({ isOpen: false, nodeId: null });
    },
    [
      destinationPickerState.nodeId,
      updateDestinationNodeData,
      nodes,
      calculateCumulativeDays,
      tripStartDate,
      setNodes,
    ]
  );

  const handleDestinationPickerClose = useCallback(() => {
    setDestinationPickerState({ isOpen: false, nodeId: null });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/travelData.json");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setDestinations(data.destinations || []);
        setHotels(data.hotels || []);
        setTransportOptions(data.transport || []);
      } catch (error) {
        console.error("Failed to fetch travel data:", error);
      }
    };
    fetchData();
  }, []);

  const addDestinationWithTransport = useCallback(() => {
    console.log("Add destination button clicked!");

    // Use state setter to get current nodes to avoid stale closure
    setNodes((currentNodes) => {
      console.log("Current nodes in callback:", currentNodes);

      // Get current destination nodes from the actual current state
      const currentDestinationNodes = currentNodes.filter(
        (n) => n.type === "destinationNode"
      );
      console.log("Current destination nodes:", currentDestinationNodes.length);

      if (currentDestinationNodes.length === 0) {
        console.log("No destination nodes found");
        return currentNodes; // Return unchanged state
      }

      // Find the destination node that is marked as the last one
      const lastDestinationNode = currentDestinationNodes.find((node) => {
        const nodeData = node.data as DestinationNodeData;
        return nodeData.isLastNode === true;
      });

      if (!lastDestinationNode) {
        console.log("No destination node with isLastNode: true found");
        console.log(
          "Available destination nodes:",
          currentDestinationNodes.map((n) => ({
            id: n.id,
            isLastNode: (n.data as DestinationNodeData).isLastNode,
          }))
        );
        return currentNodes; // Return unchanged state
      }

      console.log("Found last destination node:", lastDestinationNode.id);

      const sequenceNumber = currentDestinationNodes.length + 1;
      const lastDestinationData =
        lastDestinationNode.data as DestinationNodeData;
      const fromDestinationId = lastDestinationData.values.destination;

      // Generate unique IDs
      const transportNodeId = `transport-${Date.now()}`;
      const newDestinationNodeId = `destination-${Date.now() + 1}`;

      // Create transport node
      const transportNode: Node<TransportNodeData> = {
        id: transportNodeId,
        type: "transportNode",
        position: {
          x: lastDestinationNode.position.x + 450,
          y: lastDestinationNode.position.y,
        },
        data: {
          id: transportNodeId,
          fromDestination: fromDestinationId,
          toDestination: "",
          values: {
            transport: "",
          },
          onChange: updateTransportNodeData,
          transportOptions: transportOptions,
          destinations: destinations,
        },
      };

      // Calculate cumulative days for the new destination
      const cumulativeDaysForNew = calculateCumulativeDays(
        newDestinationNodeId,
        [
          ...currentNodes,
          {
            id: newDestinationNodeId,
            type: "destinationNode",
            data: { sequenceNumber, values: { duration: 1 } },
          } as any,
        ]
      );

      // Create new destination node
      const newDestinationNode: Node<DestinationNodeData> = {
        id: newDestinationNodeId,
        type: "destinationNode",
        position: {
          x: lastDestinationNode.position.x + 900,
          y: lastDestinationNode.position.y,
        },
        data: {
          id: newDestinationNodeId,
          sequenceNumber,
          values: {
            destination: "",
            hotel: "",
            duration: 1,
            activities: [],
          },
          onChange: updateDestinationNodeData,
          onAddDestination: addDestinationWithTransport,
          onOpenDestinationPicker: handleOpenDestinationPicker,
          destinations: destinations,
          hotels: hotels,
          isLastNode: true,
          tripStartDate,
          cumulativeDaysBeforeThis: cumulativeDaysForNew,
        },
      };

      console.log("Creating transport node:", transportNode.id);
      console.log("Creating destination node:", newDestinationNode.id);

      // Update existing nodes and add new ones
      const updatedNodes = currentNodes.map((n) => {
        if (n.id === lastDestinationNode.id && n.type === "destinationNode") {
          return {
            ...n,
            data: {
              ...n.data,
              isLastNode: false,
              onAddDestination: undefined,
              onOpenDestinationPicker: handleOpenDestinationPicker,
            },
          } as Node<DestinationNodeData>;
        }
        return n;
      });

      // Create edges and update them separately
      const edge1Id = `edge-${lastDestinationNode.id}-to-${transportNodeId}`;
      const edge2Id = `edge-${transportNodeId}-to-${newDestinationNodeId}`;

      const newEdges = [
        {
          id: edge1Id,
          source: lastDestinationNode.id,
          target: transportNodeId,
          type: "transportEdge",
        },
        {
          id: edge2Id,
          source: transportNodeId,
          target: newDestinationNodeId,
          type: "transportEdge",
        },
      ];

      console.log(
        "Creating edges:",
        newEdges.map((e) => e.id)
      );

      // Update edges in a separate call to avoid timing issues
      setTimeout(() => {
        setEdges((currentEdges) => {
          const existingEdgeIds = currentEdges.map((e) => e.id);
          const filteredNewEdges = newEdges.filter(
            (edge) => !existingEdgeIds.includes(edge.id)
          );

          console.log(
            "Adding edges:",
            filteredNewEdges.map((e) => e.id)
          );
          return [...currentEdges, ...filteredNewEdges];
        });
      }, 0);

      return [...updatedNodes, transportNode, newDestinationNode];
    });
  }, [
    destinations,
    hotels,
    transportOptions,
    updateDestinationNodeData,
    updateTransportNodeData,
    handleOpenDestinationPicker,
    calculateCumulativeDays,
    tripStartDate,
  ]);

  const generateSuggestedItinerary = useCallback(
    (preferences: ItineraryPreferences) => {
      let suggestedNodes: Node<DestinationNodeData | TransportNodeData>[] = [];
      let suggestedEdges: Edge[] = [];

      // Generate suggestions based on preferences
      const selectedDestinations = [];

      if (preferences.interests.includes("desert")) {
        selectedDestinations.push("tamanrasset-algeria", "cairo-egypt");
      }
      if (
        preferences.interests.includes("cultural") ||
        preferences.interests.includes("history")
      ) {
        selectedDestinations.push("istanbul-turkey", "marrakech-tlemcen");
      }
      if (preferences.interests.includes("urban")) {
        selectedDestinations.push("paris-france", "london-uk");
      }
      if (preferences.interests.includes("coastal")) {
        selectedDestinations.push("oran-algeria", "dubai-uae");
      }

      // Fallback to local destinations if no matches
      if (selectedDestinations.length === 0) {
        selectedDestinations.push("alger-algeria", "constantine-algeria");
      }

      const destinationsToUse = selectedDestinations.slice(
        0,
        preferences.duration || 2
      );

      // Create destination and transport nodes
      let cumulativeDays = 0;
      destinationsToUse.forEach((destId, index) => {
        const destination = destinations.find((d) => d.id === destId);
        if (destination) {
          const hotelChoice =
            preferences.travelStyle === "budget"
              ? "budget"
              : preferences.travelStyle === "luxury"
              ? "luxury"
              : preferences.travelStyle === "premium"
              ? "premium"
              : "standard";

          const isLastDestination = index === destinationsToUse.length - 1;

          // Create destination node
          const destinationNode: Node<DestinationNodeData> = {
            id: `destination-${index + 1}`,
            type: "destinationNode",
            position: { x: 300 + index * 800, y: 100 },
            data: {
              id: `destination-${index + 1}`,
              sequenceNumber: index + 1,
              values: {
                destination: destId,
                hotel: hotelChoice,
                duration: destination.avgStayDays,
                activities: [],
              },
              onChange: updateDestinationNodeData,
              onAddDestination: isLastDestination
                ? addDestinationWithTransport
                : undefined,
              onOpenDestinationPicker: handleOpenDestinationPicker,
              destinations: destinations,
              hotels: hotels,
              isLastNode: isLastDestination,
              tripStartDate,
              cumulativeDaysBeforeThis: cumulativeDays,
            },
          };

          suggestedNodes.push(destinationNode);

          // Update cumulative days for next destination
          cumulativeDays += destination.avgStayDays;

          // Create transport node if not the last destination
          if (!isLastDestination) {
            const transportNode: Node<TransportNodeData> = {
              id: `transport-${index + 1}`,
              type: "transportNode",
              position: { x: 300 + index * 800 + 450, y: 100 },
              data: {
                id: `transport-${index + 1}`,
                fromDestination: destId,
                toDestination: destinationsToUse[index + 1],
                values: {
                  transport: "flight", // Default to flight
                },
                onChange: updateTransportNodeData,
                transportOptions: transportOptions,
                destinations: destinations,
              },
            };

            suggestedNodes.push(transportNode);

            // Create edges
            suggestedEdges.push({
              id: `e-dest-${index + 1}-transport-${index + 1}`,
              source: `destination-${index + 1}`,
              target: `transport-${index + 1}`,
              type: "transportEdge",
            });

            suggestedEdges.push({
              id: `e-transport-${index + 1}-dest-${index + 2}`,
              source: `transport-${index + 1}`,
              target: `destination-${index + 2}`,
              type: "transportEdge",
            });
          }
        }
      });

      setNodes(suggestedNodes);
      setEdges(suggestedEdges);
    },
    [
      destinations,
      hotels,
      transportOptions,
      updateDestinationNodeData,
      updateTransportNodeData,
      addDestinationWithTransport,
      handleOpenDestinationPicker,
      tripStartDate,
    ]
  );

  const handleStartBuilding = useCallback(
    (data: {
      destination: string;
      startDate: string;
      duration: number;
      interests: string[];
    }) => {
      // Convert to old format for now
      const preferences: ItineraryPreferences = {
        interests: data.interests,
        duration: data.duration,
        startDate: data.startDate,
        travelStyle: "standard",
      };
      generateSuggestedItinerary(preferences);
      setIsModalOpen(false);
    },
    [generateSuggestedItinerary]
  );

  const handleShare = useCallback(() => {
    const destinationNodes = nodes.filter((n) => n.type === "destinationNode");
    if (destinationNodes.length === 0) {
      setSaveError(
        "Please add at least one destination to your itinerary before sharing."
      );
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    const serializableNodes = nodes.map((node) => {
      if (node.type === "destinationNode") {
        const {
          onChange,
          onAddDestination,
          onOpenDestinationPicker,
          destinations,
          hotels,
          ...restData
        } = node.data as DestinationNodeData;
        return { ...node, data: restData };
      } else {
        const { onChange, transportOptions, destinations, ...restData } =
          node.data as TransportNodeData;
        return { ...node, data: restData };
      }
    });

    const itineraryData = {
      nodes: serializableNodes,
      edges: edges,
      tripStartDate: tripStartDate.toISOString(),
    };

    const jsonString = JSON.stringify(itineraryData);
    const encodedData = btoa(jsonString);
    const shareUrl = `${window?.location.origin}${window?.location.pathname}?itinerary=${encodedData}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setShareSuccess(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShareSuccess(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        // Fallback: show the URL in a prompt for manual copying
        prompt("Copy this link to share your trip:", shareUrl);
      });
  }, [nodes, edges]);

  const handleSave = useCallback(async () => {
    const destinationNodes = nodes.filter((n) => n.type === "destinationNode");
    if (destinationNodes.length === 0) {
      setSaveError(
        "Please add at least one destination to your itinerary before saving."
      );
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    const itineraryName = prompt(
      "Please name your itinerary:",
      "My Amazing Trip"
    );
    if (!itineraryName) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const serializableNodes = nodes.map((node) => {
        if (node.type === "destinationNode") {
          const {
            onChange,
            onAddDestination,
            onOpenDestinationPicker,
            destinations,
            hotels,
            ...restData
          } = node.data as DestinationNodeData;
          return { ...node, data: restData };
        } else {
          const { onChange, transportOptions, destinations, ...restData } =
            node.data as TransportNodeData;
          return { ...node, data: restData };
        }
      });

      const payload = {
        name: itineraryName,
        itinerary: {
          nodes: serializableNodes,
          edges: edges,
          tripStartDate: tripStartDate.toISOString(),
        },
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("/api/save-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveSuccess(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
        console.log("Trip saved successfully:", result);
      } else {
        setSaveError(result.error || "Failed to save trip");
        setTimeout(() => setSaveError(null), 3000);
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      setSaveError("Network error. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, tripStartDate]);

  // Load shared itinerary from URL parameters
  useEffect(() => {
    const loadSharedItinerary = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedItinerary = urlParams.get("itinerary");

        if (encodedItinerary) {
          const decodedData = atob(encodedItinerary);
          const itineraryData = JSON.parse(decodedData);

          if (itineraryData.nodes && itineraryData.edges) {
            // Restore nodes with functions
            const restoredNodes = itineraryData.nodes.map((node: any) => {
              if (node.type === "destinationNode") {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    onChange: updateDestinationNodeData,
                    onAddDestination: node.data.isLastNode
                      ? addDestinationWithTransport
                      : undefined,
                    onOpenDestinationPicker: handleOpenDestinationPicker,
                    destinations: destinations,
                    hotels: hotels,
                  },
                };
              } else if (node.type === "transportNode") {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    onChange: updateTransportNodeData,
                    transportOptions: transportOptions,
                    destinations: destinations,
                  },
                };
              }
              return node;
            });

            setNodes(restoredNodes);
            setEdges(itineraryData.edges);

            // Restore trip start date if available
            if (itineraryData.tripStartDate) {
              setTripStartDate(new Date(itineraryData.tripStartDate));
            }

            setIsModalOpen(false); // Close the modal since we're loading a shared trip

            // Clean URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            console.log("Successfully loaded shared itinerary");
          }
        }
      } catch (error) {
        console.error("Failed to load shared itinerary:", error);
      }
    };

    // Only load shared itinerary if we have all necessary data loaded
    if (
      destinations.length > 0 &&
      hotels.length > 0 &&
      transportOptions.length > 0
    ) {
      loadSharedItinerary();
    }
  }, [
    destinations,
    hotels,
    transportOptions,
    updateDestinationNodeData,
    updateTransportNodeData,
    addDestinationWithTransport,
    handleOpenDestinationPicker,
  ]);

  // Update all destination nodes when trip start date changes
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          if (node.type === "destinationNode") {
            const cumulativeDaysBeforeThis = calculateCumulativeDays(
              node.id,
              currentNodes
            );
            return {
              ...node,
              data: {
                ...node.data,
                tripStartDate,
                cumulativeDaysBeforeThis,
              },
            } as Node<DestinationNodeData>;
          }
          return node;
        });
      });
    }
  }, [tripStartDate, calculateCumulativeDays]);

  return (
    <div className="h-screen w-full bg-gray-50">
      {isModalOpen && (
        <PreBuilderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleStartBuilding}
        />
      )}

      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          className="bg-gray-50"
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls className="bg-white border border-gray-200 rounded-lg shadow-lg" />
        </ReactFlow>
      </div>

      <TripHUD
        nodes={nodes}
        destinations={destinations}
        hotels={hotels}
        transportOptions={transportOptions}
        onSave={handleSave}
        onShare={handleShare}
        tripStartDate={tripStartDate}
        onTripStartDateChange={setTripStartDate}
        shareSuccess={shareSuccess}
        saveSuccess={saveSuccess}
        saveError={saveError}
        isSaving={isSaving}
      />

      {/* Add First Destination Button - Only shown when no nodes exist */}
      {nodes.length === 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => {
              const newDestinationNode: Node<DestinationNodeData> = {
                id: "destination-1",
                type: "destinationNode",
                position: { x: 300, y: 100 },
                data: {
                  id: "destination-1",
                  sequenceNumber: 1,
                  values: {
                    destination: "",
                    hotel: "",
                    duration: 1,
                    activities: [],
                  },
                  onChange: updateDestinationNodeData,
                  onAddDestination: addDestinationWithTransport,
                  onOpenDestinationPicker: handleOpenDestinationPicker,
                  destinations: destinations,
                  hotels: hotels,
                  isLastNode: true,
                  tripStartDate,
                  cumulativeDaysBeforeThis: 0,
                },
              };
              setNodes([newDestinationNode]);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Start Building Trip</span>
          </button>
        </div>
      )}

      {/* Global Destination Picker Modal */}
      <DestinationPicker
        destinations={destinations.map((d) => ({
          id: d.id,
          name: d.name,
          country: d.country,
          continent: d.continent,
          coordinates: d.coordinates || { lat: 0, lng: 0 },
          description: d.description,
          activities: d.activities,
          avgStayDays: d.avgStayDays,
          bestMonths: d.bestMonths,
          emoji: d.emoji || "🏙️",
          popularity: d.popularity || 3,
        }))}
        selectedDestination={
          destinationPickerState.nodeId
            ? (() => {
                const node = nodes.find(
                  (n) => n.id === destinationPickerState.nodeId
                );
                return node?.type === "destinationNode"
                  ? (node.data as DestinationNodeData).values.destination || ""
                  : "";
              })()
            : ""
        }
        onSelect={handleDestinationSelect}
        isOpen={destinationPickerState.isOpen}
        onClose={handleDestinationPickerClose}
      />
    </div>
  );
};

export default ItineraryBuilderPage;
