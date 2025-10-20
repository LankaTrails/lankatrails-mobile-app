import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import BackButton from "@/components/BackButton";
import TripSharingModal from "@/components/TripSharingModal";
import {
  getDirectChatRoom,
  getChatRoomById,
  getGroupChatRoomByTripId,
  getRoomMessages,
  ChatRoomNotFoundError,
} from "@/services/chatService";
import { generateTripInvitation } from "@/services/tripService";
import {
  DirectChatRoom,
  GroupChatRoom,
  ChatMessage,
  ChatMessageType,
} from "@/types/chatTypes";
import { TripInvitationRequest, TripRole } from "@/types/triptypes";
import { getToken } from "@/utils/tokenStorage";
import { useAuth } from "@/hooks/useAuth";

interface TypingStateDto {
  roomId: number;
  userId: number;
  username: string; // Backend sends 'username' not 'userName'
  timestamp: string;
  typing: boolean; // Backend sends 'typing' not 'isTyping'
}

interface ReadReceiptDto {
  messageId?: string | null;
  roomId?: number | null;
}

interface WebSocketErrorResponse {
  errorCode: string;
  message: string;
  userMessage: string;
  errorType: string;
  timestamp?: string;
}

export default function Chat() {
  // Get parameters from route
  const params = useLocalSearchParams();

  // Get logged-in user
  const { user } = useAuth();

  const tripId = params.tripId ? Number(params.tripId) : undefined;
  const providerId = params.providerId ? Number(params.providerId) : undefined;
  const roomId = params.roomId ? Number(params.roomId) : undefined;
  const chatType = (params.chatType as "group" | "direct") || "direct";
  const tripName = params.tripName as string | undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const [chatRoom, setChatRoom] = useState<
    GroupChatRoom | DirectChatRoom | null
  >(null);
  const [isLoadingChatRoom, setIsLoadingChatRoom] = useState(false);
  const [showInvitationFlow, setShowInvitationFlow] = useState(false);
  const [invitationError, setInvitationError] =
    useState<ChatRoomNotFoundError | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const stompClientRef = useRef<Client | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to get user info by senderId
  const getUserInfo = useCallback(
    (senderId: number) => {
      if (!chatRoom) {
        console.log(`No chat room data available for senderId: ${senderId}`);
        return { name: `User ${senderId}`, id: senderId };
      }

      // Check if it's the current user
      if (senderId === user?.id) {
        return { name: "You", id: senderId };
      }

      if (chatRoom.chatRoomType === "DIRECT") {
        const directRoom = chatRoom as DirectChatRoom;

        // Check if sender is the provider
        if (directRoom.provider && directRoom.providerId === senderId) {
          // console.log(
          //   `Found provider info for senderId ${senderId}:`,
          //   directRoom.provider.businessName
          // );
          return {
            name: directRoom.provider.businessName,
            id: senderId,
            avatar: directRoom.provider.profilePictureUrl,
          };
        }

        // Check if sender is the tourist
        if (directRoom.tourist && directRoom.touristId === senderId) {
          const name = `${directRoom.tourist.firstName} ${directRoom.tourist.lastName}`;
          // console.log(`Found tourist info for senderId ${senderId}:`, name);
          return {
            name,
            id: senderId,
            avatar: directRoom.tourist.profilePictureUrl,
          };
        }
      } else if (chatRoom.chatRoomType === "GROUP") {
        const groupRoom = chatRoom as GroupChatRoom;

        // Find participant by senderId
        const participant = groupRoom.participants.find(
          (p) => p.id === senderId
        );
        if (participant) {
          const name = `${participant.firstName} ${participant.lastName}`;
          console.log(`Found participant info for senderId ${senderId}:`, name);
          return {
            name,
            id: senderId,
            avatar: participant.profilePictureUrl,
          };
        }
      }

      // Fallback
      console.log(
        `No participant info found for senderId ${senderId}, using fallback`
      );
      return { name: `User ${senderId}`, id: senderId };
    },
    [chatRoom, user?.id]
  );

  // Helper function to get chat room title
  const getChatRoomTitle = useCallback(() => {
    if (!chatRoom) return "Chat";

    if (chatRoom.chatRoomType === "DIRECT") {
      const directRoom = chatRoom as DirectChatRoom;

      // Show the other participant's name
      if (directRoom.provider && directRoom.providerId !== user?.id) {
        return directRoom.provider.businessName;
      }

      if (directRoom.tourist && directRoom.touristId !== user?.id) {
        return `${directRoom.tourist.firstName} ${directRoom.tourist.lastName}`;
      }

      return "Direct Chat";
    } else if (chatRoom.chatRoomType === "GROUP") {
      // For group chats, use trip name if available, otherwise fallback
      return tripName || "Group Chat";
    }

    return "Chat";
  }, [chatRoom, user?.id, tripName]);

  // Connect to chat using STOMP client
  const connectChat = useCallback(
    async (roomId: number) => {
      if (stompClientRef.current?.connected) {
        console.log("STOMP client already connected");
        return;
      }

      try {
        const token = await getToken("ACCESS_TOKEN");
        if (!token) {
          console.error("No authentication token found");
          Alert.alert(
            "Authentication Required",
            "Please log in to access chat rooms."
          );
          return;
        }

        console.log(`Connecting to STOMP for room ${roomId}...`);
        setIsReconnecting(true);

        const baseUrl =
          process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
        const wsUrl = baseUrl.replace(/\/api$/, "") + "/ws";
        console.log(`Using WebSocket URL: ${wsUrl}`);

        stompClientRef.current = new Client({
          webSocketFactory: () => new SockJS(wsUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (msg) => console.log("STOMP Debug:", msg),
          reconnectDelay: 5000,
          heartbeatIncoming: 30000,
          heartbeatOutgoing: 30000,
        });

        stompClientRef.current.onConnect = () => {
          console.log("✅ STOMP connected successfully");
          setIsConnected(true);
          setIsReconnecting(false);

          if (!stompClientRef.current) return;

          console.log(`Setting up subscriptions for room ${roomId}...`);

          try {
            // Subscribe to chat room messages
            stompClientRef.current.subscribe(`/topic/room.${roomId}`, (msg) => {
              try {
                console.log("📨 Received message:", msg.body);
                const messageData: ChatMessage = JSON.parse(msg.body);

                setMessages((prev) => {
                  // Check if this is a real message replacing a temporary one
                  if (messageData.senderId === user?.id) {
                    // Remove any temporary messages from the same user with similar content and timing
                    const filteredMessages = prev.filter((m) => {
                      if (
                        m.id &&
                        m.id.startsWith("temp_") &&
                        m.content === messageData.content &&
                        m.senderId === messageData.senderId &&
                        Math.abs(
                          new Date(m.sentAt).getTime() -
                            new Date(messageData.sentAt).getTime()
                        ) < 10000
                      ) {
                        console.log("Replacing temporary message:", m.id);
                        return false;
                      }
                      return true;
                    });

                    // Check if the real message already exists
                    const exists = filteredMessages.find((m) => {
                      if (messageData.id && m.id === messageData.id)
                        return true;
                      return false;
                    });

                    if (exists) {
                      console.log(
                        "Real message already exists, skipping:",
                        messageData.id
                      );
                      return prev;
                    }

                    console.log(
                      "Adding real message (replaced temp):",
                      messageData.id
                    );
                    return [...filteredMessages, messageData];
                  } else {
                    // For messages from other users, normal duplicate check
                    const exists = prev.find((m) => {
                      if (messageData.id && m.id) {
                        return m.id === messageData.id;
                      }
                      // For messages with null IDs, check by content and recent timestamp
                      return (
                        m.content === messageData.content &&
                        m.senderId === messageData.senderId &&
                        Math.abs(
                          new Date(m.sentAt).getTime() -
                            new Date(messageData.sentAt).getTime()
                        ) < 5000
                      );
                    });

                    if (exists) {
                      console.log(
                        "Message already exists, skipping:",
                        messageData.id || "null ID"
                      );
                      return prev;
                    }
                    console.log(
                      "Adding new message from other user:",
                      messageData.id || "null ID"
                    );

                    // Mark this message as read if it's from another user
                    if (messageData.senderId !== user?.id && messageData.id) {
                      setTimeout(() => {
                        markAsRead(messageData.id || undefined);
                      }, 500); // Small delay to ensure message is processed
                    }

                    return [...prev, messageData];
                  }
                });

                // Remove sender from typing users
                setTypingUsers((prev) => {
                  const updated = { ...prev };
                  delete updated[messageData.senderId.toString()];
                  return updated;
                });
              } catch (error) {
                console.error("Error parsing chat message:", error);
              }
            });

            // Subscribe to typing indicators
            stompClientRef.current.subscribe(
              `/topic/typing.${roomId}`,
              (msg) => {
                try {
                  console.log("⌨️ Received typing indicator:", msg.body);
                  const typingData: TypingStateDto = JSON.parse(msg.body);
                  if (typingData.userId !== user?.id && typingData.typing) {
                    // Get user info from chat room participants instead of backend username
                    const userInfo = getUserInfo(typingData.userId);

                    setTypingUsers((prev) => ({
                      ...prev,
                      [typingData.userId.toString()]: userInfo.name,
                    }));

                    // Auto-hide typing indicator after 5 seconds
                    setTimeout(() => {
                      setTypingUsers((prev) => {
                        const updated = { ...prev };
                        delete updated[typingData.userId.toString()];
                        return updated;
                      });
                    }, 5000);
                  } else if (!typingData.typing) {
                    setTypingUsers((prev) => {
                      const updated = { ...prev };
                      delete updated[typingData.userId.toString()];
                      return updated;
                    });
                  }
                } catch (error) {
                  console.error("Error parsing typing indicator:", error);
                }
              }
            );

            setIsSubscribed(true);
            console.log("✅ All subscriptions set up successfully");
          } catch (error) {
            console.error("❌ Error setting up subscriptions:", error);
            setIsSubscribed(false);
          }

          // Subscribe to error queue
          stompClientRef.current.subscribe(`/user/queue/errors`, (msg) => {
            try {
              const errorResponse: WebSocketErrorResponse = JSON.parse(
                msg.body
              );
              console.error("WebSocket Error Response:", errorResponse);

              // Handle different error types
              switch (errorResponse.errorType) {
                case "auth_error":
                  Alert.alert(
                    "Authentication Error",
                    errorResponse.userMessage ||
                      "You are not authorized to perform this action."
                  );
                  break;
                case "chat_error":
                  Alert.alert(
                    "Chat Error",
                    errorResponse.userMessage ||
                      "There was an error with your chat request."
                  );
                  break;
                case "system_error":
                  Alert.alert(
                    "System Error",
                    errorResponse.userMessage ||
                      "An unexpected error occurred. Please try again."
                  );
                  break;
                default:
                  Alert.alert(
                    "Error",
                    errorResponse.userMessage ||
                      errorResponse.message ||
                      "An error occurred."
                  );
              }
            } catch (error) {
              console.error("Error parsing WebSocket error response:", error);
              Alert.alert("Error", "An unexpected error occurred.");
            }
          });
        };

        stompClientRef.current.onStompError = (frame) => {
          console.error("STOMP Error:", frame.headers["message"]);
          Alert.alert(
            "Connection Error",
            frame.headers["message"] || "STOMP connection failed"
          );
          setIsConnected(false);
          setIsReconnecting(false);
        };

        stompClientRef.current.onWebSocketError = (error) => {
          console.error("WebSocket Error:", error);
          setIsConnected(false);
        };

        stompClientRef.current.onDisconnect = () => {
          console.log("STOMP disconnected");
          setIsConnected(false);
          setIsSubscribed(false);
          setIsReconnecting(false);
          setTypingUsers({});
        };

        // Activate the STOMP client
        stompClientRef.current.activate();
      } catch (error) {
        console.error("Error connecting to chat:", error);
        setIsConnected(false);
        setIsReconnecting(false);
        Alert.alert(
          "Connection Error",
          "Failed to connect to chat server. Please try again."
        );
      }
    },
    [user?.id, getUserInfo] // Added getUserInfo dependency
  );

  // Send message via STOMP
  const sendMessage = useCallback(
    (text: string, messageId: string): void => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "failed" } : msg
          )
        );
        Alert.alert(
          "Connection Error",
          "Unable to send message. Please check your connection."
        );
        return;
      }

      if (!chatRoom?.id) {
        Alert.alert("Error", "No chat room available. Please reconnect.");
        return;
      }

      const messageData = {
        chatRoomId: chatRoom.id,
        messageType: "TEXT" as ChatMessageType,
        content: text,
        sentAt: new Date().toISOString(),
      };

      try {
        console.log("📤 Sending message via STOMP:", messageData);
        stompClientRef.current.publish({
          destination: "/app/sendMessage",
          body: JSON.stringify(messageData),
        });

        console.log("✅ Message sent successfully");
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    },
    [chatRoom?.id]
  );

  // Send typing indicators
  const sendTypingStart = useCallback((): void => {
    if (stompClientRef.current?.connected && chatRoom?.id) {
      stompClientRef.current.publish({
        destination: `/app/typing/start/room/${chatRoom.id}`,
        body: JSON.stringify({}),
      });
      console.log(`Started typing in room ${chatRoom.id}`);
    }
  }, [chatRoom?.id]);

  const sendTypingStop = useCallback((): void => {
    if (stompClientRef.current?.connected && chatRoom?.id) {
      stompClientRef.current.publish({
        destination: `/app/typing/stop/room/${chatRoom.id}`,
        body: JSON.stringify({}),
      });
      console.log(`Stopped typing in room ${chatRoom.id}`);
    }
  }, [chatRoom?.id]);

  // Mark messages as read
  const markAsRead = useCallback(
    (messageId?: string): void => {
      if (!stompClientRef.current?.connected || !chatRoom?.id) {
        console.warn(
          "Cannot mark as read: STOMP not connected or no chat room"
        );
        return;
      }

      const readReceiptData: ReadReceiptDto = {
        roomId: messageId ? null : chatRoom.id, // For room-level marking, set roomId
        messageId: messageId || null, // For single message marking, set messageId
      };

      try {
        console.log("📖 Marking as read via STOMP:", readReceiptData);
        stompClientRef.current.publish({
          destination: "/app/markAsRead",
          body: JSON.stringify(readReceiptData),
        });

        console.log(
          `✅ Read receipt sent for ${
            messageId ? `message ${messageId}` : `room ${chatRoom.id}`
          }`
        );
      } catch (error) {
        console.error("❌ Error sending read receipt:", error);
      }
    },
    [chatRoom?.id]
  );

  // Disconnect from chat
  const disconnectChat = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
      setIsSubscribed(false);
      setTypingUsers({});
      console.log("Disconnected from chat");
    }
  }, []);

  // Initialize chat room based on type
  const initializeChatRoom = useCallback(async (): Promise<void> => {
    setIsLoadingChatRoom(true);

    console.log("🔍 Chat initialization started with parameters:", {
      chatType,
      tripId,
      providerId,
      roomId,
      tripName,
    });

    try {
      let response;

      if (chatType === "group" && tripId) {
        console.log(`Initializing group chat room for trip ID: ${tripId}`);
        response = await getGroupChatRoomByTripId(tripId);
      } else if (chatType === "direct" && providerId) {
        console.log(
          `Initializing direct chat room with provider ID: ${providerId}`
        );
        response = await getDirectChatRoom(providerId);
      } else if (roomId) {
        console.log(`Initializing chat room by ID: ${roomId}`);
        response = await getChatRoomById(roomId);
      } else {
        // Better error handling with specific messages
        let errorMessage = "Invalid chat room parameters. ";

        if (!chatType || (chatType !== "group" && chatType !== "direct")) {
          errorMessage += "Chat type must be 'group' or 'direct'. ";
        }

        if (chatType === "group" && !tripId) {
          errorMessage += "Trip ID is required for group chats. ";
        }

        if (chatType === "direct" && !providerId) {
          errorMessage += "Provider ID is required for direct chats. ";
        }

        if (!tripId && !providerId && !roomId) {
          errorMessage +=
            "At least one of tripId, providerId, or roomId must be provided.";
        }

        console.error("Chat initialization error:", errorMessage);
        console.error("Received parameters:", {
          chatType,
          tripId,
          providerId,
          roomId,
        });

        throw new Error(errorMessage);
      }

      if (response.success && response.data) {
        setChatRoom(response.data as GroupChatRoom | DirectChatRoom);
        console.log("Chat room initialized successfully:", response.data);

        // Log participant information for debugging
        const roomData = response.data as GroupChatRoom | DirectChatRoom;
        if (roomData.chatRoomType === "DIRECT") {
          const directRoom = roomData as DirectChatRoom;
          console.log("Direct chat participants:", {
            provider: directRoom.provider,
            tourist: directRoom.tourist,
            currentUserId: user?.id,
          });
        } else if (roomData.chatRoomType === "GROUP") {
          const groupRoom = roomData as GroupChatRoom;
          console.log("Group chat participants:", groupRoom.participants);
        }

        // Load chat history
        if (response.data.id) {
          await loadChatHistory(response.data.id);
        }
      } else {
        const errorMsg = response.message || "Failed to initialize chat room";
        Alert.alert("Error", errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      // Handle ChatRoomNotFoundError specifically for invitation flow
      if (error instanceof ChatRoomNotFoundError) {
        console.log("✨ Chat room not available, showing invitation flow");
        setInvitationError(error);
        setShowInvitationFlow(true);
        return; // Don't show alert, let the UI handle this gracefully
      }

      // Only log actual errors, not expected invitation flows
      console.error("Error initializing chat room:", error);

      if (error instanceof Error) {
        if (error.message.includes("Authentication required")) {
          Alert.alert(
            "Authentication Required",
            "Please log in to access chat rooms."
          );
        } else {
          Alert.alert(
            "Error",
            `Failed to connect to chat room: ${error.message}`
          );
        }
      }
    } finally {
      setIsLoadingChatRoom(false);
    }
  }, [chatType, tripId, providerId, roomId]);

  // Retry chat room initialization
  const retryInitialization = useCallback((): void => {
    setShowInvitationFlow(false);
    setInvitationError(null);
    initializeChatRoom();
  }, [initializeChatRoom]);

  // Handle share trip invitation
  const handleShareTripInvitation = useCallback((): void => {
    console.log("Opening trip sharing modal for:", { tripId, tripName });
    setShowSharingModal(true);
  }, [tripId, tripName]);

  // Load existing messages for the chat room
  const loadChatHistory = useCallback(
    async (chatRoomId: number): Promise<void> => {
      try {
        console.log(`Loading chat history for room ${chatRoomId}`);
        const response = await getRoomMessages(chatRoomId);

        if (response.success && response.data) {
          // Data is already in ChatMessage format from the backend
          setMessages(response.data);
          console.log(`Loaded ${response.data.length} messages`);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    },
    []
  );

  // Handle input text changes
  const handleInputChange = (text: string): void => {
    const previousLength = inputText.length;
    setInputText(text);

    if (text.length > 0) {
      // Start typing if we weren't typing before
      if (previousLength === 0) {
        sendTypingStart();
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop();
      }, 3000) as unknown as NodeJS.Timeout;
    } else if (previousLength > 0) {
      // Stop typing when input becomes empty
      sendTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Handle send message
  const handleSend = (): void => {
    if (inputText.trim() === "" || !chatRoom?.id || !user?.id) return;

    // Create a temporary ID for tracking the message before backend assigns real ID
    const tempId = `temp_${Date.now()}_${user.id}`;

    const newMessage: ChatMessage = {
      id: tempId, // Use temporary ID instead of null
      chatRoomId: chatRoom.id,
      senderId: user.id,
      messageType: "TEXT" as ChatMessageType,
      content: inputText.trim(),
      sentAt: new Date().toISOString(),
      replyToMessageId: null,
      serviceCardId: null,
      serviceCard: null,
      files: null,
      readBy: undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    const messageText = inputText.trim();
    setInputText("");

    // Stop typing when sending message
    sendTypingStop();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendMessage(messageText, tempId); // Use temp ID for tracking

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Retry failed message
  const retryMessage = (message: ChatMessage): void => {
    if (!message.content || !message.id) return;

    sendMessage(message.content, message.id);
  };

  // Render individual message
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.senderId === user?.id;

    // Get user info from chat room participants
    const userInfo = getUserInfo(item.senderId);

    return (
      <View
        style={[
          styles.messageWrapper,
          isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper,
        ]}
      >
        <Text
          style={[
            styles.senderName,
            isCurrentUser
              ? styles.currentUserSenderName
              : styles.otherUserSenderName,
          ]}
        >
          {userInfo.name}
        </Text>
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          ]}
        >
          <Text
            style={
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            }
          >
            {item.content}
          </Text>
          {isCurrentUser && (
            <View style={styles.messageStatus}>
              <Ionicons name="paper-plane" size={12} color="#ffffff60" />
            </View>
          )}
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    const typingUserNames = Object.values(typingUsers);
    if (typingUserNames.length === 0) return null;

    const typingText =
      typingUserNames.length === 1
        ? `${typingUserNames[0]} is typing...`
        : `${typingUserNames[0]} and ${
            typingUserNames.length - 1
          } others are typing...`;

    return (
      <View style={[styles.messageWrapper, styles.otherUserWrapper]}>
        <View
          style={[
            styles.messageContainer,
            styles.otherUserMessage,
            styles.typingContainer,
          ]}
        >
          <Text style={[styles.otherUserText, styles.typingText]}>
            {typingText}
          </Text>
        </View>
      </View>
    );
  };

  // Render connection status
  const renderConnectionStatus = () => {
    if (isLoadingChatRoom) {
      return (
        <View style={styles.connectionBanner}>
          <Ionicons name="sync-outline" size={16} color="#3b82f6" />
          <Text style={styles.connectionBannerText}>
            Initializing chat room...
          </Text>
        </View>
      );
    }

    if (!chatRoom) {
      return (
        <View style={styles.connectionBanner}>
          <Ionicons name="warning-outline" size={16} color="#f59e0b" />
          <Text style={styles.connectionBannerText}>
            Chat room not connected
          </Text>
        </View>
      );
    }

    if (isConnected) {
      return (
        <View style={[styles.connectionBanner, { backgroundColor: "#f0fdf4" }]}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
          <Text style={[styles.connectionBannerText, { color: "#10b981" }]}>
            Connected to chat room {chatRoom.id}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.connectionBanner}>
        <Ionicons name="wifi-outline" size={16} color="#ef4444" />
        <Text style={styles.connectionBannerText}>
          {isReconnecting ? "Reconnecting..." : "Disconnected"}
        </Text>
        {!isReconnecting && (
          <TouchableOpacity
            onPress={() => chatRoom?.id && connectChat(chatRoom.id)}
          >
            <Text style={styles.reconnectButton}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Initialize chat room and connect STOMP
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeChatRoom();
      } catch (error) {
        console.error("Failed to initialize chat room:", error);
      }
    };

    initialize();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      disconnectChat();
    };
  }, [initializeChatRoom, disconnectChat]);

  // Connect STOMP when chat room is ready
  useEffect(() => {
    if (chatRoom?.id && !isConnected) {
      console.log(`🔌 Attempting to connect to chat room ${chatRoom.id}`);
      connectChat(chatRoom.id);
    }
  }, [chatRoom?.id, isConnected, connectChat]);

  // Mark all messages as read when chat room is loaded and connected
  useEffect(() => {
    if (isConnected && chatRoom?.id && messages.length > 0) {
      console.log(`📖 Marking all messages as read for room ${chatRoom.id}`);
      markAsRead(); // Mark all messages in the room as read
    }
  }, [isConnected, chatRoom?.id, messages.length, markAsRead]);

  // Debug messages state changes
  useEffect(() => {
    console.log(
      `📊 Messages state updated. Total messages: ${messages.length}`
    );
    if (messages.length > 0) {
      console.log("Latest message:", messages[messages.length - 1]);
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Render invitation flow UI
  const renderInvitationFlow = () => {
    if (!invitationError) return null;

    const isGroupChat = chatType === "group" && tripId;

    return (
      <View style={styles.invitationContainer}>
        <View style={styles.invitationContent}>
          {/* Icon */}
          <View style={styles.invitationIconContainer}>
            <Ionicons
              name={isGroupChat ? "people" : "chatbubble"}
              size={60}
              color="#008080"
            />
          </View>

          {/* Title */}
          <Text style={styles.invitationTitle}>
            {isGroupChat
              ? "Group Chat Not Available"
              : "Start Your Conversation"}
          </Text>

          {/* Description */}
          <Text style={styles.invitationDescription}>
            {isGroupChat
              ? `The group chat for "${
                  tripName || "this trip"
                }" isn't active yet. Invite more people to join your trip and start chatting together!`
              : "Start a conversation with this service provider by sending your first message."}
          </Text>

          {/* Action Buttons */}
          <View style={styles.invitationActions}>
            {isGroupChat && (
              <TouchableOpacity
                style={[
                  styles.invitationButton,
                  styles.primaryInvitationButton,
                  isGeneratingInvite && styles.disabledButton,
                ]}
                onPress={handleShareTripInvitation}
                disabled={isGeneratingInvite}
              >
                <Ionicons
                  name="share"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryInvitationButtonText}>
                  {isGeneratingInvite
                    ? "Generating..."
                    : "Share Trip Invitation"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Show invitation flow if chat room not found
  if (showInvitationFlow) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{getChatRoomTitle()}</Text>
          </View>
        </View>

        {renderInvitationFlow()}

        {/* Trip Sharing Modal */}
        {tripId && tripName && (
          <TripSharingModal
            visible={showSharingModal}
            onClose={() => setShowSharingModal(false)}
            tripId={tripId}
            tripName={tripName}
          />
        )}
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{getChatRoomTitle()}</Text>
          {isConnected && isSubscribed && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Live</Text>
            </View>
          )}
          {isConnected && !isSubscribed && (
            <View style={styles.onlineIndicator}>
              <View
                style={[styles.onlineDot, { backgroundColor: "#FFA500" }]}
              />
              <Text style={[styles.onlineText, { color: "#FFA500" }]}>
                Connecting...
              </Text>
            </View>
          )}
          {!isConnected && isReconnecting && (
            <View style={styles.onlineIndicator}>
              <View
                style={[styles.onlineDot, { backgroundColor: "#FFA500" }]}
              />
              <Text style={[styles.onlineText, { color: "#FFA500" }]}>
                Reconnecting...
              </Text>
            </View>
          )}
          {!isConnected && !isReconnecting && (
            <View style={styles.onlineIndicator}>
              <View
                style={[styles.onlineDot, { backgroundColor: "#FF4444" }]}
              />
              <Text style={[styles.onlineText, { color: "#FF4444" }]}>
                Offline
              </Text>
            </View>
          )}
        </View>
      </View>

      {renderConnectionStatus()}

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) =>
            item.id || `msg-${index}-${item.senderId}-${Date.now()}`
          }
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, !isConnected && styles.inputDisabled]}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={isConnected}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isConnected || inputText.trim() === "") &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!isConnected || inputText.trim() === ""}
        >
          <Ionicons
            name="send"
            size={20}
            color={!isConnected || inputText.trim() === "" ? "#9ca3af" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Trip Sharing Modal */}
      {tripId && tripName && (
        <TripSharingModal
          visible={showSharingModal}
          onClose={() => setShowSharingModal(false)}
          tripId={tripId}
          tripName={tripName}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 16,
    flexDirection: "row",
    borderRadius: 30,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  headerText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: "#6b7280",
  },
  connectionBanner: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  connectionBannerText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#dc2626",
    marginRight: "auto",
  },
  reconnectButton: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 25,
    borderRadius: 16,
    elevation: 4,
    maxHeight: "70%",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  currentUserWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherUserWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  currentUserSenderName: {
    color: "#008080",
    textAlign: "right",
  },
  otherUserSenderName: {
    color: "#6B7280",
    textAlign: "left",
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    position: "relative",
  },
  currentUserMessage: {
    backgroundColor: "#008080",
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    backgroundColor: "#e5e7eb",
    borderBottomLeftRadius: 4,
  },
  currentUserText: {
    color: "#fff",
    fontSize: 15,
  },
  otherUserText: {
    color: "#111827",
    fontSize: 15,
  },
  messageTime: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
    paddingHorizontal: 4,
  },
  messageStatus: {
    position: "absolute",
    bottom: 4,
    right: 8,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
  },
  sendButton: {
    backgroundColor: "#008080",
    padding: 12,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  // Invitation Flow Styles
  invitationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f9fafb",
  },
  invitationContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  invitationIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  invitationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  invitationDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  invitationActions: {
    width: "100%",
    gap: 12,
  },
  invitationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  primaryInvitationButton: {
    backgroundColor: "#008080",
  },
  secondaryInvitationButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#008080",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryInvitationButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryInvitationButtonText: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "600",
  },
});
