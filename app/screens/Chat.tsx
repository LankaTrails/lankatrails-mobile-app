/**
 * Chat Screen - Integrates REST API chat room creation with WebSocket real-time messaging
 * 
 * Features:
 * 1. Uses chatService.ts to create/get direct chat rooms via REST API
 * 2. WebSocket connection for real-time messaging
 * 3. Displays loading states for chat room initialization
 * 4. Handles connection status and reconnection
 * 
 * Integration with Backend:
 * - REST API: /api/chat/rooms/direct/{userId} (ChatRoomController.java)
 * - WebSocket: ws://localhost:3001 for real-time messaging
 */

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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";
import { theme } from "@/app/theme";
import { getDirectChatRoom } from "@/services/chatService";
import { ChatRoom } from "@/types/chatTypes";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  status?: "sending" | "sent" | "failed";
}

interface GroupMember {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: number;
}

interface TripDetailsType {
  budget: string;
  startDate: Date;
  endDate: Date;
  currency: string;
  distance: string;
  title: string;
  numberOfAdults: number;
  numberOfChildren: number;
}

interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'error' | 'member_joined' | 'member_left' | 'members_update';
  data: {
    id?: string;
    text?: string;
    senderId?: string;
    senderName?: string;
    timestamp?: number;
    error?: string;
    members?: GroupMember[];
    member?: GroupMember;
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string}>({}); // userId -> userName
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isLoadingChatRoom, setIsLoadingChatRoom] = useState(false);
  const [currentUser, setCurrentUser] = useState<GroupMember>({
    id: 'user_' + Date.now(),
    name: 'You',
    isOnline: true
  });
  
  const flatListRef = useRef<FlatList>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const [trip, setTrip] = useState<any>(null);
  const [tripDetails, setTripDetails] = useState<TripDetailsType>({
    budget: "45000",
    startDate: new Date("2024-06-22"),
    endDate: new Date("2024-06-26"),
    currency: "LKR",
    distance: "120km",
    title: "Galle Adventure",
    numberOfAdults: 2,
    numberOfChildren: 1,
  });

  // WebSocket URL - Replace with your server URL
  const WS_URL = 'ws://localhost:3001'; // Update this with your backend URL
  const GROUP_ID = trip?.id || 'galle_adventure_group';

  // Initialize chat room using the REST API
  const initializeChatRoom = useCallback(async (providerId?: number) => {
    if (!providerId) return;
    
    setIsLoadingChatRoom(true);
    try {
      const response = await getDirectChatRoom(providerId);
      if (response.success && response.data) {
        setChatRoom(response.data);
        console.log('Chat room initialized:', response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to initialize chat room');
      }
    } catch (error) {
      console.error('Error initializing chat room:', error);
      Alert.alert('Error', 'Failed to connect to chat room');
    } finally {
      setIsLoadingChatRoom(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setIsReconnecting(true);
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttempts.current = 0;
        
        // Send initial connection message to join group
        const joinMessage = {
          type: 'join_group',
          data: {
            groupId: GROUP_ID,
            user: currentUser,
            tripDetails: tripDetails
          }
        };
        ws.current?.send(JSON.stringify(joinMessage));
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleIncomingMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsReconnecting(false);
        
        // Clear typing users
        setTypingUsers({});
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
      setIsReconnecting(false);
      scheduleReconnect();
    }
  }, [currentUser, tripDetails, GROUP_ID]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff, max 30s
    reconnectAttempts.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      if (reconnectAttempts.current <= maxReconnectAttempts) {
        console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
        connectWebSocket();
      }
    }, delay);
  }, [connectWebSocket]);

  const handleIncomingMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'message':
        const newMessage: Message = {
          id: message.data.id || Date.now().toString(),
          text: message.data.text || '',
          senderId: message.data.senderId || '',
          senderName: message.data.senderName || 'Unknown',
          timestamp: message.data.timestamp || Date.now(),
          status: 'sent'
        };
        
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.find(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        
        // Remove sender from typing users
        if (message.data.senderId) {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[message.data.senderId!];
            return updated;
          });
        }
        break;

      case 'typing':
        if (message.data.senderId && message.data.senderName && message.data.senderId !== currentUser.id) {
          setTypingUsers(prev => ({
            ...prev,
            [message.data.senderId!]: message.data.senderName!
          }));
          
          // Auto-hide typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[message.data.senderId!];
              return updated;
            });
          }, 3000);
        }
        break;

      case 'status':
        // Handle message status updates (sent, delivered, etc.)
        if (message.data.id) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === message.data.id 
                ? { ...msg, status: 'sent' }
                : msg
            )
          );
        }
        break;

      case 'members_update':
        if (message.data.members) {
          setGroupMembers(message.data.members);
        }
        break;

      case 'member_joined':
        if (message.data.member) {
          setGroupMembers(prev => {
            const exists = prev.find(member => member.id === message.data.member!.id);
            if (exists) {
              return prev.map(member => 
                member.id === message.data.member!.id 
                  ? { ...member, isOnline: true }
                  : member
              );
            }
            return [...prev, message.data.member!];
          });
        }
        break;

      case 'member_left':
        if (message.data.member) {
          setGroupMembers(prev => 
            prev.map(member => 
              member.id === message.data.member!.id 
                ? { ...member, isOnline: false, lastSeen: Date.now() }
                : member
            )
          );
        }
        break;

      case 'error':
        Alert.alert('Error', message.data.error || 'An error occurred');
        break;
    }
  };

  const sendMessage = (text: string, messageId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      Alert.alert('Connection Error', 'Unable to send message. Please check your connection.');
      return;
    }

    const messageData = {
      type: 'group_message',
      data: {
        id: messageId,
        text: text,
        senderId: currentUser.id,
        senderName: currentUser.name,
        timestamp: Date.now(),
        groupId: GROUP_ID
      }
    };

    try {
      ws.current.send(JSON.stringify(messageData));
      // Mark message as sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    }
  };

  const sendTypingIndicator = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const typingData = {
        type: 'typing',
        data: {
          senderId: currentUser.id,
          senderName: currentUser.name,
          groupId: GROUP_ID
        }
      };
      ws.current.send(JSON.stringify(typingData));
    }
  }, [currentUser, GROUP_ID]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    // Send typing indicator
    if (text.length > 0) {
      sendTypingIndicator();
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        // Typing indicator will auto-expire on backend
      }, 1000);
    }
  };

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      text: inputText.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      timestamp: Date.now(),
      status: "sending"
    };

    setMessages(prev => [...prev, newMessage]);
    const messageText = inputText.trim();
    setInputText("");

    // Send message via WebSocket
    sendMessage(messageText, messageId);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const retryMessage = (message: Message) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, status: 'sending' }
          : msg
      )
    );
    sendMessage(message.text, message.id);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUser.id;
    
    return (
      <View style={[styles.messageWrapper, isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper]}>
        <Text style={[styles.senderName, isCurrentUser ? styles.currentUserSenderName : styles.otherUserSenderName]}>
          {item.senderName}
        </Text>
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          ]}
        >
          <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>{item.text}</Text>
          {isCurrentUser && (
            <View style={styles.messageStatus}>
              {item.status === 'sending' && (
                <Ionicons name="time-outline" size={12} color="#ffffff80" />
              )}
              {item.status === 'sent' && (
                <Ionicons name="checkmark" size={12} color="#ffffff80" />
              )}
              {item.status === 'failed' && (
                <TouchableOpacity onPress={() => retryMessage(item)}>
                  <Ionicons name="refresh" size={12} color="#ff6b6b" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    const typingUserNames = Object.values(typingUsers);
    if (typingUserNames.length === 0) return null;
    
    const typingText = typingUserNames.length === 1 
      ? `${typingUserNames[0]} is typing...`
      : typingUserNames.length === 2
      ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
      : `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`;
    
    return (
      <View style={[styles.messageWrapper, styles.otherUserWrapper]}>
        <View style={[styles.messageContainer, styles.otherUserMessage, styles.typingContainer]}>
          <Text style={[styles.otherUserText, styles.typingText]}>{typingText}</Text>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  const renderGroupMembers = () => {
    const onlineMembers = groupMembers.filter(member => member.isOnline);
    const offlineMembers = groupMembers.filter(member => !member.isOnline);
    
    return (
      <View style={styles.membersContainer}>
        <Text style={styles.membersTitle}>
          Group Members ({groupMembers.length})
        </Text>
        
        {onlineMembers.length > 0 && (
          <View style={styles.membersList}>
            <Text style={styles.membersSubtitle}>Online ({onlineMembers.length})</Text>
            {onlineMembers.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <View style={[styles.memberStatus, styles.memberOnline]} />
                <Text style={styles.memberName}>
                  {member.name} {member.id === currentUser.id ? '(You)' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {offlineMembers.length > 0 && (
          <View style={styles.membersList}>
            <Text style={styles.membersSubtitle}>Offline ({offlineMembers.length})</Text>
            {offlineMembers.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <View style={[styles.memberStatus, styles.memberOffline]} />
                <Text style={[styles.memberName, styles.memberOfflineName]}>
                  {member.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateCard}>
        <Ionicons
          name="people-outline"
          size={48}
          color="#008080"
          style={styles.emptyStateIcon}
        />
        <Text style={styles.emptyStateTitle}>Welcome to the Group Chat</Text>
        <Text style={styles.emptyStateDescription}>
          Start chatting with your group about the trip to {trip?.tripName || tripDetails.title}
        </Text>
        
        {groupMembers.length > 0 && renderGroupMembers()}
        
        {!isConnected && (
          <View style={styles.connectionStatus}>
            <Ionicons name="wifi-outline" size={16} color="#ef4444" />
            <Text style={styles.connectionStatusText}>
              {isReconnecting ? 'Connecting...' : 'Disconnected'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderConnectionStatus = () => {
    if (isLoadingChatRoom) {
      return (
        <View style={styles.connectionBanner}>
          <Ionicons name="sync-outline" size={16} color="#3b82f6" />
          <Text style={styles.connectionBannerText}>Initializing chat room...</Text>
        </View>
      );
    }
    
    if (isConnected) return null;
    
    return (
      <View style={styles.connectionBanner}>
        <Ionicons name="wifi-outline" size={16} color="#ef4444" />
        <Text style={styles.connectionBannerText}>
          {isReconnecting ? 'Reconnecting...' : 'Disconnected'}
        </Text>
        {!isReconnecting && (
          <TouchableOpacity onPress={connectWebSocket}>
            <Text style={styles.reconnectButton}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Initialize WebSocket connection and chat room
  useEffect(() => {
    connectWebSocket();
    
    // Initialize chat room for direct messaging (example with provider ID)
    // You can modify this to get the actual provider/user ID from route params or props
    const exampleProviderId = 123; // Replace with actual provider ID from navigation params
    initializeChatRoom(exampleProviderId);
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (ws.current) {
        // Send leave group message
        const leaveMessage = {
          type: 'leave_group',
          data: {
            groupId: GROUP_ID,
            user: currentUser
          }
        };
        ws.current.send(JSON.stringify(leaveMessage));
        ws.current.close(1000, 'Component unmounted');
      }
    };
  }, [connectWebSocket, initializeChatRoom, GROUP_ID, currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerText}>
          <Text 
            style={[
              styles.headerTitle,
              (trip?.tripName || tripDetails.title).length > 15 && styles.headerTitleLong,
              (trip?.tripName || tripDetails.title).length > 25 && styles.headerTitleVeryLong
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {trip?.tripName || tripDetails.title}
          </Text>
          {isConnected && groupMembers.length > 0 && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                {groupMembers.filter(m => m.isOnline).length} online
              </Text>
            </View>
          )}
        </View>
      </View>

      {renderConnectionStatus()}

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={[...messages]}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            !isConnected && styles.inputDisabled
          ]}
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
            (!isConnected || inputText.trim() === "") && styles.sendButtonDisabled
          ]} 
          onPress={handleSend}
          disabled={!isConnected || inputText.trim() === ""}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={(!isConnected || inputText.trim() === "") ? "#9ca3af" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 16,
    flexDirection: 'row',
    borderRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  headerTitleLong: {
    fontSize: 20,
  },
  headerTitleVeryLong: {
    fontSize: 16,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#6b7280',
  },
  connectionBanner: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  connectionBannerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#dc2626',
    marginRight: 'auto',
  },
  reconnectButton: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 25,
    borderRadius: 16,
    elevation: 4,
    maxHeight: '70%',
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
    fontWeight: '500',
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
    position: 'relative',
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
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginHorizontal: 1,
    opacity: 0.6,
  },
  membersContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  membersList: {
    marginBottom: 12,
  },
  membersSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  memberOnline: {
    backgroundColor: '#10b981',
  },
  memberOffline: {
    backgroundColor: '#9ca3af',
  },
  memberName: {
    fontSize: 14,
    color: '#374151',
  },
  memberOfflineName: {
    color: '#9ca3af',
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
    shadowColor: '#000',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightPrimary,
    maxWidth: 300,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  connectionStatusText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#ef4444',
  },
});