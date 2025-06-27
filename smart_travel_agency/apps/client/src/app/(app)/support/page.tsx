"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Bot,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import { useT } from "@/hooks/useT";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  transcriptType?: "partial" | "final";
}

interface CallState {
  isActive: boolean;
  status: string;
  duration: number;
}

const SupportPage = () => {
  const t = useT();

  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    status: t("support.callStatus.ready"),
    duration: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [assistantOverrides, setAssistantOverrides] = useState({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addMessage = useCallback(
    (
      role: Message["role"],
      content: string,
      transcriptType?: "partial" | "final"
    ) => {
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role,
        content,
        timestamp: new Date(),
        transcriptType,
      };

      setMessages((prev) => {
        if (transcriptType === "partial") {
          const filtered = prev.filter(
            (msg) => !(msg.role === role && msg.transcriptType === "partial")
          );
          return [...filtered, newMessage];
        }

        if (transcriptType === "final") {
          const filtered = prev.filter(
            (msg) => !(msg.role === role && msg.transcriptType === "partial")
          );
          return [...filtered, newMessage];
        }

        return [...prev, newMessage];
      });

      console.log("Message added:", newMessage);
    },
    []
  );

  const startCall = useCallback(async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      alert(t("support.messages.configurationError"));
      return;
    }

    try {
      console.log("Starting Vapi call with assistant ID:", assistantId);

      // Start the call with optional overrides
      if (Object.keys(assistantOverrides).length > 0) {
        await vapi.start(assistantId, assistantOverrides);
      } else {
        await vapi.start(assistantId);
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setCallState((prev) => ({
        ...prev,
        status: t("support.callStatus.failed"),
      }));
    }
  }, [assistantOverrides]);

  // End call function
  const endCall = useCallback(async () => {
    try {
      console.log("Ending Vapi call");
      await vapi.stop();
    } catch (error) {
      console.error("Error ending call:", error);
    }
  }, []);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
    console.log("Microphone", newMutedState ? "muted" : "unmuted");
  }, [isMuted]);

  // Send message function
  const sendMessage = useCallback(
    (content: string, role: "system" | "user" = "system") => {
      vapi.send({
        type: "add-message",
        message: {
          role,
          content,
        },
      });
      console.log("Message sent to assistant:", { role, content });
    },
    []
  );

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    console.log("Conversation cleared");
  }, []);

  // Update call duration
  const updateDuration = useCallback(() => {
    if (callStartTimeRef.current) {
      const duration = Math.floor(
        (Date.now() - callStartTimeRef.current.getTime()) / 1000
      );
      setCallState((prev) => ({ ...prev, duration }));
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Setup Vapi event listeners
  useEffect(() => {
    // Call lifecycle events
    vapi.on("call-start", () => {
      console.log("Call started");
      setCallState({
        isActive: true,
        status: t("support.callStatus.connected"),
        duration: 0,
      });
      callStartTimeRef.current = new Date();

      // Start duration timer
      durationIntervalRef.current = setInterval(updateDuration, 1000);

      // Add welcome message
      addMessage("assistant", t("support.messages.welcome"));
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setCallState({
        isActive: false,
        status: "Disconnected",
        duration: 0,
      });
      callStartTimeRef.current = null;
      setIsListening(false);
      setIsTyping(false);
      setVolumeLevel(0);

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    });

    // Speech events
    vapi.on("speech-start", () => {
      console.log("Speech started");
      setIsListening(true);
      setCallState((prev) => ({ ...prev, status: "Listening..." }));
    });

    vapi.on("speech-end", () => {
      console.log("Speech ended");
      setIsListening(false);
      setCallState((prev) => ({ ...prev, status: "Processing..." }));
      setIsTyping(true);
    });

    // Volume level events
    vapi.on("volume-level", (volume: number) => {
      setVolumeLevel(volume);
    });

    // Message events
    vapi.on("message", (message: any) => {
      console.log("Vapi message received:", message);

      if (message.type === "transcript") {
        const role = message.role === "assistant" ? "assistant" : "user";
        addMessage(role, message.transcript, message.transcriptType);

        if (
          message.transcriptType === "final" &&
          message.role === "assistant"
        ) {
          setIsTyping(false);
          setCallState((prev) => ({ ...prev, status: "Connected" }));
        }
      }

      // Handle function calls
      if (message.type === "function-call") {
        console.log("Function call:", message.functionCall);
        addMessage("system", `Function called: ${message.functionCall.name}`);
      }

      // Handle other message types
      if (message.type === "status-update") {
        console.log("Status update:", message.status);
      }
    });

    // Error handling
    vapi.on("error", (error: any) => {
      console.error("Vapi error:", error);
      setCallState((prev) => ({ ...prev, status: "Connection Error" }));
      setIsListening(false);
      setIsTyping(false);
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up Vapi listeners");
      vapi.removeAllListeners();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [addMessage, updateDuration]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("support.title")}
            </h1>
            <p className="text-gray-600">{t("support.subtitle")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-4 p-4! bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Public Key:</span>
              <span className="ml-2 text-gray-600">
                {process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
                  ? "✓ Configured"
                  : "❌ Missing"}
              </span>
            </div>
            <div>
              <span className="font-medium">Assistant ID:</span>
              <span className="ml-2 text-gray-600">
                {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
                  ? "✓ Configured"
                  : "❌ Missing"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Chat Interface */}
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col bg-white">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-300/15">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg">Wanderbot</h2>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        callState.isActive
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {callState.status}
                    </span>
                    {callState.isActive && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(callState.duration)}
                      </span>
                    )}
                    <Badge
                      variant={callState.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {callState.isActive ? "Live" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Audio Indicators */}
              {callState.isActive && (
                <div className="flex items-center space-x-2">
                  {/* Volume indicator */}
                  <div className="flex items-center space-x-1">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-100"
                        style={{
                          width: `${Math.min(volumeLevel * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Listening indicator */}
                  {isListening && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <span className="text-xs">Listening</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-0">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto min-h-80">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages
                    .filter((message, index, array) => {
                      // Keep only the last occurrence of messages with the same content
                      const lastIndex = array
                        .map((m) => m.content)
                        .lastIndexOf(message.content);
                      return index === lastIndex;
                    })
                    .map((message) => {
                      const isBot = message.role === "assistant";
                      const isPartial = message.transcriptType === "partial";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isBot ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isBot
                                ? "bg-gray-100 text-gray-900"
                                : "bg-blue-600 text-white"
                            } ${isPartial ? "opacity-60" : ""}`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {process.env.NODE_ENV === "development" && (
                              <p className="text-xs opacity-60 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                                {isPartial && " (partial)"}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to Wanderbot!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your AI travel assistant is ready to help with:
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Trip recommendations & planning</p>
                      <p>• Booking assistance & support</p>
                      <p>• Destination information</p>
                      <p>• Travel tips & advice</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={callState.isActive ? endCall : startCall}
                  variant={callState.isActive ? "destructive" : "default"}
                  size="lg"
                  className="flex-1"
                  disabled={!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}
                >
                  {callState.isActive ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      {t("support.controls.endCall")}
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      {t("support.controls.startCall")}
                    </>
                  )}
                </Button>

                {/* Mute toggle */}
                {callState.isActive && (
                  <Button onClick={toggleMute} variant="outline" size="lg">
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                )}

                {/* Clear chat */}
                {messages.length > 0 && (
                  <Button
                    onClick={clearConversation}
                    variant="outline"
                    size="lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
