// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useSocket } from "../Context/SocketContext";
import { useAuth } from "../Context/AuthContext";
import NewChatModal from "../components/modals/NewChatModal";
import AdminContactModal from "../components/modals/AdminContactModal";
import chatService from "../services/chatServices";
import {
  Send,
  Menu,
  X,
  Plus,
  MessageCircle,
  User,
  ChevronLeft,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  Shield,
  Lock,
  Unlock,
  MoreVertical,
  Trash2,
} from "lucide-react";

const Chat = () => {
  const location = useLocation();
  const isAdminChat = location.pathname === "/chat";

  const { socket, connected, onlineUsers, getOnlineStatus } = useSocket();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isAdminContactModalOpen, setIsAdminContactModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messageEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatOptionRef = useRef(null);

  // Close chat options when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        chatOptionRef.current &&
        !chatOptionRef.current.contains(event.target)
      ) {
        setShowChatOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch chats when component mounts or when socket connects
  useEffect(() => {
    if (connected) {
      fetchChats();
    }
  }, [connected]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (message) => {
      if (selectedChat && selectedChat.id === message.chatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        // Mark as read if we're currently viewing this chat
        socket.emit("mark-read", { chatId: message.chatId });
      }

      // Only update unread count if the message is from someone else
      if (message.senderId !== user?.id) {
        updateChatUnreadCount(message.chatId);
      }
    };

    const handleUnreadUpdate = ({ chatId }) => {
      updateChatUnreadCount(chatId);
    };

    const handleUserTyping = ({ chatId, userId, userName }) => {
      if (selectedChat && selectedChat.id === chatId) {
        setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
      }
    };

    const handleUserStopTyping = ({ chatId, userId }) => {
      if (selectedChat && selectedChat.id === chatId) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    };

    const handleChatStatusChanged = ({ chatId, adminApproved, isBlocked }) => {
      if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat((prev) => ({
          ...prev,
          adminApproved,
          isBlocked,
        }));
      }

      // Also update the chat in the list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, adminApproved, isBlocked } : chat
        )
      );
    };

    const handleChatDeleted = ({ chatId }) => {
      // Remove the chat from the list
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // If the current chat was deleted, clear it
      if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    };

    const handleSocketError = (error) => {
      console.error("Socket error:", error);
      setError(error.message);
    };

    // Register event listeners
    socket.on("new-message", handleNewMessage);
    socket.on("unread-update", handleUnreadUpdate);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);
    socket.on("chat-status-changed", handleChatStatusChanged);
    socket.on("chat-deleted", handleChatDeleted);
    socket.on("error", handleSocketError);

    // Cleanup on unmount or when dependencies change
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("unread-update", handleUnreadUpdate);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      socket.off("chat-status-changed", handleChatStatusChanged);
      socket.off("chat-deleted", handleChatDeleted);
      socket.off("error", handleSocketError);
    };
  }, [socket, connected, selectedChat, user?.id]);

  // Scroll to bottom when messages change or selecting a new chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom when selecting a chat
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedChat?.id, messages.length]);

  // Focus input when chat changes
  useEffect(() => {
    if (selectedChat) {
      messageInputRef.current?.focus();
      // Close mobile menu when chat is selected
      setMobileMenuOpen(false);
    }
  }, [selectedChat]);

  // Request online status for users in chats
  useEffect(() => {
    // When chats change, request online status for all users
    if (socket && connected && chats.length > 0) {
      // Extract all user IDs from chats
      const userIds = new Set();

      chats.forEach((chat) => {
        // Add participants
        if (chat.participants && Array.isArray(chat.participants)) {
          chat.participants.forEach((participant) => {
            if (participant && participant.id) {
              userIds.add(participant.id);
            }
          });
        }

        // Add message senders
        if (chat.lastMessage && chat.lastMessage.senderId) {
          userIds.add(chat.lastMessage.senderId);
        }
      });

      // Request online status if we have any user IDs
      if (userIds.size > 0) {
        getOnlineStatus(Array.from(userIds));
      }
    }
  }, [chats, socket, connected, getOnlineStatus]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await chatService.getUserChats();
      setChats(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.message || "Failed to load chats");
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      const data = await chatService.getChatById(chatId);

      if (!data) {
        throw new Error("No data returned from server");
      }

      setSelectedChat(data);

      // Check if messages property exists and is an array
      if (!data.messages || !Array.isArray(data.messages)) {
        console.warn("Chat data doesn't contain messages array:", data);
        setMessages([]);
      } else {
        // Process messages to ensure they have a valid sender
        const processedMessages = data.messages.map((msg) => {
          // If message doesn't have a sender but has senderId, create sender object
          if (!msg.sender && msg.senderId) {
            return {
              ...msg,
              sender: {
                id: msg.senderId,
                name: `User ${msg.senderId.substring(0, 5)}`,
              },
            };
          }
          return msg;
        });

        setMessages(processedMessages);
      }

      // Mark messages as read
      if (socket && connected) {
        socket.emit("mark-read", { chatId });
      }

      // Also mark as read through API
      await chatService.markAsRead(chatId);

      // Update unread count in UI
      updateChatUnreadCount(chatId, 0);

      setLoading(false);

      // Scroll to bottom after loading
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Failed to load messages");
      setLoading(false);
    }
  };

  const updateChatUnreadCount = (chatId, count = null) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          // If count is provided, use it, otherwise increment
          const newCount = count !== null ? count : chat.unreadCount + 1;
          return { ...chat, unreadCount: newCount };
        }
        return chat;
      })
    );
  };

  const handleChatSelect = (chat) => {
    if (!chat || !chat.id) return; // Add null check before selecting chat
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleNewChatCreated = (newChat) => {
    // Add the new chat to our list and select it
    setChats((prevChats) => [newChat, ...prevChats]);
    setSelectedChat(newChat);
    fetchMessages(newChat.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat || !socket || !connected) return;

    // Check if chat is blocked or needs admin approval (unless user is admin)
    if (selectedChat.isBlocked) {
      setError("This conversation has been blocked by an administrator.");
      return;
    }

    if (!selectedChat.adminApproved && user?.role !== "ADMIN") {
      setError(
        "Please wait for an admin to approve this conversation before sending messages."
      );
      return;
    }

    const messageContent = messageInput;

    // Clear input right away for better UX
    setMessageInput("");

    // Try socket first
    try {
      // Emit message to socket
      socket.emit("send-message", {
        chatId: selectedChat.id,
        content: messageContent,
      });

      // Clear typing indicator
      handleStopTyping();
    } catch (socketErr) {
      console.error("Socket error when sending message:", socketErr);

      // If socket fails, try API
      try {
        await chatService.sendMessage(selectedChat.id, messageContent);
      } catch (apiErr) {
        console.error("API error when sending message:", apiErr);

        // Show error message but don't redirect
        if (
          apiErr.response &&
          apiErr.response.data &&
          apiErr.response.data.message
        ) {
          setError(apiErr.response.data.message);
        } else {
          setError("Failed to send message. Please try again.");
        }

        // Put the message back in the input field
        setMessageInput(messageContent);
      }
    }
  };

  // const handleSendMessage = (e) => {
  //   e.preventDefault();
  //   if (!messageInput.trim() || !selectedChat || !socket || !connected) return;

  //   // Check if chat is blocked or needs admin approval (unless user is admin)
  //   if (selectedChat.isBlocked) {
  //     setError("This conversation has been blocked by an administrator.");
  //     return;
  //   }

  //   if (!selectedChat.adminApproved && user?.role !== 'ADMIN') {
  //     setError("Please wait for an admin to approve this conversation before sending messages.");
  //     return;
  //   }

  //   // Emit message to socket
  //   socket.emit("send-message", {
  //     chatId: selectedChat.id,
  //     content: messageInput,
  //   });

  //   // Clear input
  //   setMessageInput("");

  //   // Clear typing indicator
  //   handleStopTyping();
  // };

  const handleApproveChat = async () => {
    if (!selectedChat || user?.role !== "ADMIN") return;

    try {
      await chatService.approveChatRequest(selectedChat.id);
      // Update the selected chat with new status
      setSelectedChat((prev) => ({
        ...prev,
        adminApproved: true,
        isBlocked: false,
      }));

      // Update the chat in the list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, adminApproved: true, isBlocked: false }
            : chat
        )
      );
    } catch (err) {
      console.error("Error approving chat:", err);
      setError(err.message || "Failed to approve conversation");
    }
  };

  const handleBlockChat = async () => {
    if (!selectedChat || user?.role !== "ADMIN") return;

    try {
      await chatService.blockChat(selectedChat.id);
      // Update the selected chat with new status
      setSelectedChat((prev) => ({
        ...prev,
        isBlocked: true,
      }));

      // Update the chat in the list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id ? { ...chat, isBlocked: true } : chat
        )
      );

      // Close the options menu
      setShowChatOptions(false);
    } catch (err) {
      console.error("Error blocking chat:", err);
      setError(err.message || "Failed to block conversation");
    }
  };

  const handleUnblockChat = async () => {
    if (!selectedChat || user?.role !== "ADMIN") return;

    try {
      await chatService.unblockChat(selectedChat.id);
      // Update the selected chat with new status
      setSelectedChat((prev) => ({
        ...prev,
        isBlocked: false,
      }));

      // Update the chat in the list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id ? { ...chat, isBlocked: false } : chat
        )
      );

      // Close the options menu
      setShowChatOptions(false);
    } catch (err) {
      console.error("Error unblocking chat:", err);
      setError(err.message || "Failed to unblock conversation");
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat || user?.role !== "ADMIN") return;

    try {
      await chatService.deleteChat(selectedChat.id);

      // Remove the chat from the list
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== selectedChat.id)
      );

      // Clear selected chat
      setSelectedChat(null);

      // Close the confirmation dialog
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError(err.message || "Failed to delete conversation");
    }
  };
  const handleTyping = () => {
    if (!selectedChat || !socket || !connected) return;

    // Don't send typing indicator if chat is blocked or not approved
    if (
      selectedChat.isBlocked ||
      (!selectedChat.adminApproved && user?.role !== "ADMIN")
    ) {
      return;
    }

    // Send typing indicator
    socket.emit("typing", { chatId: selectedChat.id });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
  };

  const handleStopTyping = () => {
    if (!selectedChat || !socket || !connected) return;
    socket.emit("stop-typing", { chatId: selectedChat.id });
  };

  const getOtherParticipant = (chat) => {
    // Check if chat has participants array with entries
    if (
      !chat ||
      !chat.participants ||
      !Array.isArray(chat.participants) ||
      chat.participants.length === 0
    ) {
      // If we have a lastMessage with senderId, we can use that to create a basic user object
      if (chat?.lastMessage?.senderId) {
        const userId = chat.lastMessage.senderId;

        return {
          id: userId,
          name: `User ${userId.substring(0, 5)}`,
          isOnline: !!onlineUsers[userId],
        };
      }
      return { name: "Unknown User", id: "unknown", isOnline: false };
    }

    // Try to find a participant that isn't the current user
    const otherParticipants = chat.participants.filter((participant) => {
      // Notice we're checking userId, not id
      return participant && participant.userId !== user?.id;
    });

    // If we found another participant, return it with online status
    if (otherParticipants.length > 0) {
      const otherParticipant = otherParticipants[0];

      return {
        id: otherParticipant.userId || otherParticipant.id,
        name:
          otherParticipant?.name ||
          otherParticipant?.user?.name ||
          `User ${otherParticipant.id}`,
        isOnline: !!onlineUsers[otherParticipant.id],
        isAdmin: otherParticipant?.user?.role === "ADMIN",
      };
    }

    // If all else fails, return the first participant
    if (chat.participants[0]) {
      const firstParticipant = chat.participants[0];

      return {
        id: firstParticipant.userId,
        name:
          firstParticipant.user?.name ||
          `User ${firstParticipant.id.substring(0, 5)}`,
        isOnline: !!onlineUsers[firstParticipant.userId],
        isAdmin: firstParticipant.user?.role === "ADMIN",
      };
    }

    return {
      name: "Unknown User",
      id: "unknown",
      isOnline: false,
      isAdmin: false,
    };
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatDate = (dateString) => {
    const today = new Date();
    const messageDate = new Date(dateString);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return format(messageDate, "MMM d, yyyy");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (name, isAdmin = false) => {
    if (isAdmin) {
      return "bg-blue-500"; // Use blue for admins
    }

    const colors = [
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-emerald-500",
    ];

    // Use the name to generate a consistent color
    let hash = 0;
    for (let i = 0; i < name?.length || 0; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages || !Array.isArray(messages)) {
      return [];
    }

    const groups = {};

    messages.forEach((message) => {
      if (!message || !message.createdAt) return;

      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const groupedMessages = groupMessagesByDate(messages);

  // Determine page title based on route
  const pageTitle = isAdminChat ? "Administrator Support" : "Messages";

  // Handle contact admin or new chat click based on current route
  const handleNewChatClick = () => {
    if (isAdminChat) {
      setIsAdminContactModalOpen(true);
    } else {
      setIsNewChatModalOpen(true);
    }
  };

  // Check if the selected chat needs approval and user isn't admin
  const needsApproval =
    selectedChat && !selectedChat.adminApproved && user?.role !== "ADMIN";

  // Check if the selected chat is blocked
  const isBlocked = selectedChat && selectedChat.isBlocked;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - hidden on mobile when chat is selected unless menu is open */}
      <div
        className={`
          ${mobileMenuOpen ? "fixed inset-0 z-50 bg-white" : "hidden md:block"}
          w-full md:w-80 lg:w-96 border-r bg-white overflow-y-auto
        `}
      >
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle size={20} className="text-blue-500" />
            <span>{pageTitle}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChatClick}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title={isAdminChat ? "Contact Administrator" : "New Conversation"}
            >
              <Plus size={20} />
            </button>
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {loading && chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 p-4">
            <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mb-1">No conversations yet</p>
                <button
                  onClick={handleNewChatClick}
                  className="text-blue-500 font-medium hover:underline"
                >
                  {isAdminChat
                    ? "Contact an administrator"
                    : "Start a new chat"}
                </button>
              </div>
            ) : (
              chats.map((chat) => {
                if (!chat || !chat.id) return null; // Add null check for chat object
                const otherUser = getOtherParticipant(chat);
                const avatarColor = getRandomColor(
                  otherUser.name,
                  otherUser.isAdmin
                );

                return (
                  <li
                    key={chat.id}
                    className={`
                      p-4 cursor-pointer hover:bg-gray-50 transition-colors
                      ${chat.isBlocked ? "opacity-70" : ""}
                      ${selectedChat?.id === chat.id ? "bg-blue-50" : ""}
                    `}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white shadow-sm`}
                        >
                          {getInitials(otherUser.name)}
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-sm">
                            {chat.unreadCount}
                          </div>
                        )}
                        {chat.isBlocked && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            <Lock size={12} />
                          </div>
                        )}
                        {!chat.adminApproved && !chat.isBlocked && (
                          <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            <Clock size={12} />
                          </div>
                        )}
                        <div
                          className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${
                            otherUser.isOnline ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 truncate">
                              {otherUser.name}
                            </h3>
                            {otherUser.isAdmin && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-sm font-medium">
                                Admin
                              </span>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(chat.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {chat.lastMessage &&
                            chat.lastMessage.senderId === user?.id && (
                              <CheckCheck
                                size={14}
                                className="text-gray-400 min-w-max"
                              />
                            )}
                          <p className="text-sm text-gray-600 truncate">
                            {chat.isBlocked
                              ? "This conversation has been blocked"
                              : !chat.adminApproved && user?.role !== "ADMIN"
                              ? "Waiting for admin approval..."
                              : chat.lastMessage && chat.lastMessage.content
                              ? chat.lastMessage.content
                              : "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50 relative">
        {/* Mobile Header with menu button - only visible on mobile */}
        <div className="md:hidden sticky top-0 z-20 p-3 bg-white border-b shadow-sm flex items-center gap-2">
          <button
            className="text-gray-600 p-1"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          {selectedChat && (
            <button
              onClick={() => setSelectedChat(null)}
              className="flex items-center text-blue-500 gap-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}
        </div>

        {selectedChat ? (
          <>
            {/* Admin approval banner */}
            {selectedChat &&
              !selectedChat.adminApproved &&
              user?.role === "ADMIN" && (
                <div className="sticky top-0 z-30 p-3 bg-yellow-50 border-b border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle size={18} />
                      <span>
                        New conversation request from{" "}
                        {getOtherParticipant(selectedChat).name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApproveChat}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={handleBlockChat}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Block
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* User waiting for approval banner */}
            {selectedChat &&
              !selectedChat.adminApproved &&
              user?.role !== "ADMIN" && (
                <div className="sticky top-0 z-30 p-3 bg-yellow-50 border-b border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock size={18} />
                    <span>
                      Waiting for admin approval. You'll be notified when you
                      can send messages.
                    </span>
                  </div>
                </div>
              )}

            {/* Blocked chat banner */}
            {selectedChat && selectedChat.isBlocked && (
              <div className="sticky top-0 z-30 p-3 bg-red-50 border-b border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <Lock size={18} />
                  <span>
                    This conversation has been blocked by an administrator.
                  </span>
                </div>
              </div>
            )}

            {/* Chat Header */}
            <div className="sticky top-0 md:top-0 z-10 p-4 bg-white border-b shadow-sm flex items-center">
              <div
                className={`w-10 h-10 rounded-full ${getRandomColor(
                  getOtherParticipant(selectedChat).name,
                  getOtherParticipant(selectedChat).isAdmin
                )} flex items-center justify-center text-white shadow-sm`}
              >
                {getInitials(getOtherParticipant(selectedChat).name)}
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">
                    {getOtherParticipant(selectedChat).name}
                  </h3>
                  {getOtherParticipant(selectedChat).isAdmin && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-sm font-medium flex items-center gap-1">
                      <Shield size={10} />
                      <span>Admin</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {Object.values(typingUsers).length > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span>
                        {Object.values(typingUsers).join(", ")} typing...
                      </span>
                    </>
                  ) : getOtherParticipant(selectedChat).isOnline ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <Clock size={12} />
                      <span>Last seen recently</span>
                    </>
                  )}
                </div>
              </div>

              {/* Admin Actions Menu */}
              {user?.role === "ADMIN" && selectedChat && (
                <div className="ml-auto relative" ref={chatOptionRef}>
                  <button
                    onClick={() => setShowChatOptions(!showChatOptions)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {showChatOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-30 py-1 border">
                      {!selectedChat.isBlocked ? (
                        <button
                          onClick={handleBlockChat}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Lock size={14} />
                          <span>Block Conversation</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleUnblockChat}
                          className="w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Unlock size={14} />
                          <span>Unblock Conversation</span>
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        <span>Delete Conversation</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {isBlocked
                      ? "This conversation has been blocked by an administrator."
                      : needsApproval
                      ? "Please wait for an administrator to approve this conversation."
                      : `Start the conversation with ${
                          getOtherParticipant(selectedChat).name
                        }`}
                  </p>
                  {!isBlocked && !needsApproval && (
                    <div className="w-full max-w-xs">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-3">
                      <div className="flex justify-center">
                        <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                          {group.date}
                        </div>
                      </div>

                      {group.messages.map((message, messageIndex) => {
                        if (!message || !message.sender) return null; // Add null check for message
                        const isCurrentUser = message.sender.id === user?.id;
                        const showAvatar =
                          messageIndex === 0 ||
                          group.messages[messageIndex - 1]?.sender?.id !==
                            message.sender?.id;
                        const isFromAdmin =
                          !isCurrentUser &&
                          getOtherParticipant(selectedChat).isAdmin;
                        const avatarColor = getRandomColor(
                          message.sender?.name || "Unknown",
                          isFromAdmin
                        );

                        return (
                          <div
                            key={message.id || `msg-${messageIndex}`}
                            className={`flex ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <div className="flex-shrink-0 mr-2">
                                <div
                                  className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs`}
                                >
                                  {getInitials(message.sender?.name)}
                                </div>
                              </div>
                            )}

                            <div
                              className={`
                                max-w-xs sm:max-w-sm md:max-w-md rounded-lg px-4 py-2 shadow-sm
                                ${
                                  isCurrentUser
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : isFromAdmin
                                    ? "bg-blue-100 text-gray-800 rounded-bl-none"
                                    : "bg-white text-gray-800 rounded-bl-none"
                                }
                              `}
                            >
                              <div className="mb-1">
                                {!isCurrentUser && showAvatar && (
                                  <span className="font-medium text-xs text-gray-500">
                                    {message.sender?.name || "Unknown"}
                                  </span>
                                )}
                              </div>
                              <p className="break-words">{message.content}</p>
                              <div className="text-right mt-1">
                                <span
                                  className={`text-xs ${
                                    isCurrentUser
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {message.createdAt
                                    ? formatTime(message.createdAt)
                                    : ""}
                                  {isCurrentUser && (
                                    <CheckCheck
                                      size={12}
                                      className="inline ml-1"
                                    />
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 p-4 bg-white border-t shadow-md">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Don't handle typing for blocked or unapproved chats (unless admin)
                    if (isBlocked || (needsApproval && user?.role !== "ADMIN"))
                      return;

                    // Handle typing indication
                    handleTyping();

                    // Send message when Enter key is pressed
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevent default form submission
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={
                    isBlocked
                      ? "This conversation has been blocked"
                      : needsApproval
                      ? "Waiting for admin approval..."
                      : "Type a message..."
                  }
                  className={`
                    flex-1 py-3 px-4 border border-gray-300 rounded-full 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${
                      (isBlocked || needsApproval) && user?.role !== "ADMIN"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }
                  `}
                  disabled={
                    (isBlocked || needsApproval) && user?.role !== "ADMIN"
                  }
                />
                <button
                  type="submit"
                  disabled={
                    !messageInput.trim() ||
                    ((isBlocked || needsApproval) && user?.role !== "ADMIN")
                  }
                  className={`
                    p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${
                      !messageInput.trim() ||
                      ((isBlocked || needsApproval) && user?.role !== "ADMIN")
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }
                    transition-colors
                  `}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {pageTitle}
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              {isAdminChat
                ? "Contact our administrators for assistance with your account or services"
                : "Send private messages to friends and start conversations"}
            </p>
            <button
              onClick={handleNewChatClick}
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium flex items-center gap-2"
            >
              <Plus size={20} />
              <span>
                {isAdminChat ? "Contact Administrator" : "New Message"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          <span>Disconnected from server</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Conversation
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modals */}
      {isAdminChat ? (
        <AdminContactModal
          isOpen={isAdminContactModalOpen}
          onClose={() => setIsAdminContactModalOpen(false)}
          onChatCreated={handleNewChatCreated}
        />
      ) : (
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          onChatCreated={handleNewChatCreated}
        />
      )}

      {/* Error toast */}
      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle size={20} />
          <div>
            <p>{error}</p>
            <button
              className="text-xs underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

// // src/pages/Chat.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useLocation } from "react-router-dom";
// import { format } from "date-fns";
// import { useSocket } from "../Context/SocketContext";
// import { useAuth } from "../Context/AuthContext";
// import NewChatModal from "../components/modals/NewChatModal";
// import AdminContactModal from "../components/modals/AdminContactModal";
// import chatService from "../services/chatServices";
// import {
//   Send,
//   Menu,
//   X,
//   Plus,
//   MessageCircle,
//   User,
//   ChevronLeft,
//   CheckCheck,
//   Clock,
//   AlertCircle,
//   Info,
//   Shield,
//   Lock
// } from "lucide-react";

// const Chat = () => {
//   const location = useLocation();
//   const isAdminChat = location.pathname === '/chat';

//   const { socket, connected, onlineUsers, getOnlineStatus } = useSocket();
//   const { user } = useAuth();
//   const [chats, setChats] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [typingUsers, setTypingUsers] = useState({});
//   const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
//   const [isAdminContactModalOpen, setIsAdminContactModalOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const messageEndRef = useRef(null);
//   const messageInputRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   // Fetch chats when component mounts or when socket connects
//   useEffect(() => {
//     if (connected) {
//       fetchChats();
//     }
//   }, [connected]);

//   // Setup socket event listeners
//   useEffect(() => {
//     if (!socket || !connected) return;

//     const handleNewMessage = (message) => {
//       if (selectedChat && selectedChat.id === message.chatId) {
//         setMessages((prevMessages) => [...prevMessages, message]);
//         // Mark as read if we're currently viewing this chat
//         socket.emit("mark-read", { chatId: message.chatId });
//       }

//       // Only update unread count if the message is from someone else
//       if (message.senderId !== user?.id) {
//         updateChatUnreadCount(message.chatId);
//       }
//     };

//     const handleUnreadUpdate = ({ chatId }) => {
//       updateChatUnreadCount(chatId);
//     };

//     const handleUserTyping = ({ chatId, userId, userName }) => {
//       if (selectedChat && selectedChat.id === chatId) {
//         setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
//       }
//     };

//     const handleUserStopTyping = ({ chatId, userId }) => {
//       if (selectedChat && selectedChat.id === chatId) {
//         setTypingUsers((prev) => {
//           const updated = { ...prev };
//           delete updated[userId];
//           return updated;
//         });
//       }
//     };

//     const handleChatStatusChanged = ({ chatId, adminApproved, isBlocked }) => {
//       if (selectedChat && selectedChat.id === chatId) {
//         setSelectedChat(prev => ({
//           ...prev,
//           adminApproved,
//           isBlocked
//         }));
//       }

//       // Also update the chat in the list
//       setChats(prevChats =>
//         prevChats.map(chat =>
//           chat.id === chatId
//             ? { ...chat, adminApproved, isBlocked }
//             : chat
//         )
//       );
//     };

//     const handleSocketError = (error) => {
//       console.error("Socket error:", error);
//       setError(error.message);
//     };

//     // Register event listeners
//     socket.on("new-message", handleNewMessage);
//     socket.on("unread-update", handleUnreadUpdate);
//     socket.on("user-typing", handleUserTyping);
//     socket.on("user-stop-typing", handleUserStopTyping);
//     socket.on("chat-status-changed", handleChatStatusChanged);
//     socket.on("error", handleSocketError);

//     // Cleanup on unmount or when dependencies change
//     return () => {
//       socket.off("new-message", handleNewMessage);
//       socket.off("unread-update", handleUnreadUpdate);
//       socket.off("user-typing", handleUserTyping);
//       socket.off("user-stop-typing", handleUserStopTyping);
//       socket.off("chat-status-changed", handleChatStatusChanged);
//       socket.off("error", handleSocketError);
//     };
//   }, [socket, connected, selectedChat, user?.id]);

//   // Scroll to bottom when messages change
// // Scroll to bottom when messages change or when selecting a new chat
// // Scroll to the bottom whenever a chat is selected
// useEffect(() => {
//   if (selectedChat && messages.length > 0) {
//     // Small delay to ensure messages are rendered before scrolling
//     setTimeout(() => {
//       messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   }
// }, [selectedChat?.id, messages.length]);
//   // Focus input when chat changes
//   useEffect(() => {
//     if (selectedChat) {
//       messageInputRef.current?.focus();
//       // Close mobile menu when chat is selected
//       setMobileMenuOpen(false);
//     }
//   }, [selectedChat]);

//   // Request online status for users in chats
//   useEffect(() => {
//     // When chats change, request online status for all users
//     if (socket && connected && chats.length > 0) {
//       // Extract all user IDs from chats
//       const userIds = new Set();

//       chats.forEach(chat => {
//         // Add participants
//         if (chat.participants && Array.isArray(chat.participants)) {
//           chat.participants.forEach(participant => {
//             if (participant && participant.id) {
//               userIds.add(participant.id);
//             }
//           });
//         }

//         // Add message senders
//         if (chat.lastMessage && chat.lastMessage.senderId) {
//           userIds.add(chat.lastMessage.senderId);
//         }
//       });

//       // Request online status if we have any user IDs
//       if (userIds.size > 0) {
//         getOnlineStatus(Array.from(userIds));
//       }
//     }
//   }, [chats, socket, connected, getOnlineStatus]);

//   const fetchChats = async () => {
//     try {
//       setLoading(true);
//       const data = await chatService.getUserChats();
//       setChats(data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//       setError(err.message || "Failed to load chats");
//       setLoading(false);
//     }
//   };

//   const fetchMessages = async (chatId) => {
//     try {
//       setLoading(true);
//       const data = await chatService.getChatById(chatId);

//       if (!data) {
//         throw new Error("No data returned from server");
//       }

//       setSelectedChat(data);

//       // Check if messages property exists and is an array
//       if (!data.messages || !Array.isArray(data.messages)) {
//         console.warn("Chat data doesn't contain messages array:", data);
//         setMessages([]);
//       } else {
//         // Process messages to ensure they have a valid sender
//         const processedMessages = data.messages.map(msg => {
//           // If message doesn't have a sender but has senderId, create sender object
//           if (!msg.sender && msg.senderId) {
//             return {
//               ...msg,
//               sender: {
//                 id: msg.senderId,
//                 name: `User ${msg.senderId.substring(0, 5)}`
//               }
//             };
//           }
//           return msg;
//         });

//         setMessages(processedMessages);
//       }

//       // Mark messages as read
//       if (socket && connected) {
//         socket.emit("mark-read", { chatId });
//       }

//       // Also mark as read through API
//       await chatService.markAsRead(chatId);

//       // Update unread count in UI
//       updateChatUnreadCount(chatId, 0);

//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching messages:", err);
//       setError(err.message || "Failed to load messages");
//       setLoading(false);
//     }
//   };

//   const updateChatUnreadCount = (chatId, count = null) => {
//     setChats((prevChats) =>
//       prevChats.map((chat) => {
//         if (chat.id === chatId) {
//           // If count is provided, use it, otherwise increment
//           const newCount = count !== null ? count : chat.unreadCount + 1;
//           return { ...chat, unreadCount: newCount };
//         }
//         return chat;
//       })
//     );
//   };

//   const handleChatSelect = (chat) => {
//     if (!chat || !chat.id) return; // Add null check before selecting chat
//     setSelectedChat(chat);
//     fetchMessages(chat.id);
//   };

//   const handleNewChatCreated = (newChat) => {
//     // Add the new chat to our list and select it
//     setChats((prevChats) => [newChat, ...prevChats]);
//     setSelectedChat(newChat);
//     fetchMessages(newChat.id);
//   };

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!messageInput.trim() || !selectedChat || !socket || !connected) return;

//     // Check if chat is blocked or needs admin approval (unless user is admin)
//     if (selectedChat.isBlocked) {
//       setError("This conversation has been blocked by an administrator.");
//       return;
//     }

//     if (!selectedChat.adminApproved && user?.role !== 'ADMIN') {
//       setError("Please wait for an admin to approve this conversation before sending messages.");
//       return;
//     }

//     // Emit message to socket
//     socket.emit("send-message", {
//       chatId: selectedChat.id,
//       content: messageInput,
//     });

//     // Clear input
//     setMessageInput("");

//     // Clear typing indicator
//     handleStopTyping();
//   };

//   const handleApproveChat = async () => {
//     if (!selectedChat || user?.role !== 'ADMIN') return;

//     try {
//       await chatService.approveChatRequest(selectedChat.id);
//       // Update the selected chat with new status
//       setSelectedChat(prev => ({
//         ...prev,
//         adminApproved: true,
//         isBlocked: false
//       }));

//       // Update the chat in the list
//       setChats(prevChats =>
//         prevChats.map(chat =>
//           chat.id === selectedChat.id
//             ? { ...chat, adminApproved: true, isBlocked: false }
//             : chat
//         )
//       );
//     } catch (err) {
//       console.error("Error approving chat:", err);
//       setError(err.message || "Failed to approve conversation");
//     }
//   };

//   const handleBlockChat = async () => {
//     if (!selectedChat || user?.role !== 'ADMIN') return;

//     try {
//       await chatService.blockChat(selectedChat.id);
//       // Update the selected chat with new status
//       setSelectedChat(prev => ({
//         ...prev,
//         isBlocked: true
//       }));

//       // Update the chat in the list
//       setChats(prevChats =>
//         prevChats.map(chat =>
//           chat.id === selectedChat.id
//             ? { ...chat, isBlocked: true }
//             : chat
//         )
//       );
//     } catch (err) {
//       console.error("Error blocking chat:", err);
//       setError(err.message || "Failed to block conversation");
//     }
//   };

//   const handleTyping = () => {
//     if (!selectedChat || !socket || !connected) return;

//     // Don't send typing indicator if chat is blocked or not approved
//     if (selectedChat.isBlocked || (!selectedChat.adminApproved && user?.role !== 'ADMIN')) {
//       return;
//     }

//     // Send typing indicator
//     socket.emit("typing", { chatId: selectedChat.id });

//     // Clear previous timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Set new timeout
//     typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
//   };

//   const handleStopTyping = () => {
//     if (!selectedChat || !socket || !connected) return;
//     socket.emit("stop-typing", { chatId: selectedChat.id });
//   };

//   const getOtherParticipant = (chat) => {
//     // Check if chat has participants array with entries
//     if (!chat || !chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) {
//       // If we have a lastMessage with senderId, we can use that to create a basic user object
//       if (chat?.lastMessage?.senderId) {
//         const userId = chat.lastMessage.senderId;

//         return {
//           id: userId,
//           name: `User ${userId.substring(0, 5)}`,
//           isOnline: !!onlineUsers[userId]
//         };
//       }
//       return { name: "Unknown User", id: "unknown", isOnline: false };
//     }

//     // Try to find a participant that isn't the current user
//     const otherParticipants = chat.participants.filter(participant => {
//       // Notice we're checking userId, not id
//       return participant && participant.userId !== user?.id;
//     });

//     // If we found another participant, return it with online status
//     if (otherParticipants.length > 0) {
//       const otherParticipant = otherParticipants[0];

//       return {
//         id: otherParticipant.userId || otherParticipant.id,
//         name: otherParticipant?.name || otherParticipant?.user?.name || `User ${otherParticipant.id}`,
//         isOnline: !!onlineUsers[otherParticipant.id],
//         isAdmin: otherParticipant?.user?.role === 'ADMIN'
//       };
//     }

//     // If all else fails, return the first participant
//     if (chat.participants[0]) {
//       const firstParticipant = chat.participants[0];

//       return {
//         id: firstParticipant.userId,
//         name: firstParticipant.user?.name || `User ${firstParticipant.id.substring(0, 5)}`,
//         isOnline: !!onlineUsers[firstParticipant.userId],
//         isAdmin: firstParticipant.user?.role === 'ADMIN'
//       };
//     }

//     return { name: "Unknown User", id: "unknown", isOnline: false, isAdmin: false };
//   };

//   const formatTime = (dateString) => {
//     return format(new Date(dateString), "h:mm a");
//   };

//   const formatDate = (dateString) => {
//     const today = new Date();
//     const messageDate = new Date(dateString);

//     if (messageDate.toDateString() === today.toDateString()) {
//       return "Today";
//     }

//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     if (messageDate.toDateString() === yesterday.toDateString()) {
//       return "Yesterday";
//     }

//     return format(messageDate, "MMM d, yyyy");
//   };

//   const getInitials = (name) => {
//     if (!name) return "U";
//     return name
//       .split(" ")
//       .map((part) => part[0])
//       .join("")
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   const getRandomColor = (name, isAdmin = false) => {
//     if (isAdmin) {
//       return "bg-blue-500"; // Use blue for admins
//     }

//     const colors = [
//       "bg-green-500", "bg-purple-500",
//       "bg-pink-500", "bg-indigo-500", "bg-teal-500",
//       "bg-orange-500", "bg-cyan-500", "bg-emerald-500"
//     ];

//     // Use the name to generate a consistent color
//     let hash = 0;
//     for (let i = 0; i < name?.length || 0; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }

//     return colors[Math.abs(hash) % colors.length];
//   };

//   // Group messages by date
//   const groupMessagesByDate = (messages) => {
//     if (!messages || !Array.isArray(messages)) {
//       return [];
//     }

//     const groups = {};

//     messages.forEach(message => {
//       if (!message || !message.createdAt) return;

//       const date = formatDate(message.createdAt);
//       if (!groups[date]) {
//         groups[date] = [];
//       }
//       groups[date].push(message);
//     });

//     return Object.entries(groups).map(([date, messages]) => ({
//       date,
//       messages
//     }));
//   };

//   const groupedMessages = groupMessagesByDate(messages);

//   // Determine page title based on route
//   const pageTitle = isAdminChat ? "Administrator Support" : "Messages";

//   // Handle contact admin or new chat click based on current route
//   const handleNewChatClick = () => {
//     if (isAdminChat) {
//       setIsAdminContactModalOpen(true);
//     } else {
//       setIsNewChatModalOpen(true);
//     }
//   };

//   // Check if the selected chat needs approval and user isn't admin
//   const needsApproval = selectedChat && !selectedChat.adminApproved && user?.role !== 'ADMIN';

//   // Check if the selected chat is blocked
//   const isBlocked = selectedChat && selectedChat.isBlocked;

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar - hidden on mobile when chat is selected unless menu is open */}
//       <div
//         className={`
//           ${mobileMenuOpen ? "fixed inset-0 z-50 bg-white" : "hidden md:block"}
//           w-full md:w-80 lg:w-96 border-r bg-white overflow-y-auto
//         `}
//       >
//         <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center shadow-sm">
//           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//             <MessageCircle size={20} className="text-blue-500" />
//             <span>{pageTitle}</span>
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleNewChatClick}
//               className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               title={isAdminChat ? "Contact Administrator" : "New Conversation"}
//             >
//               <Plus size={20} />
//             </button>
//             <button
//               className="md:hidden p-2 text-gray-500"
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {loading && chats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-40 p-4">
//             <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mb-4"></div>
//             <p className="text-gray-500">Loading conversations...</p>
//           </div>
//         ) : (
//           <ul className="divide-y divide-gray-200">
//             {chats.length === 0 ? (
//               <div className="flex flex-col items-center justify-center p-8 text-center">
//                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                   <MessageCircle size={24} className="text-gray-400" />
//                 </div>
//                 <p className="text-gray-500 mb-1">No conversations yet</p>
//                 <button
//                   onClick={handleNewChatClick}
//                   className="text-blue-500 font-medium hover:underline"
//                 >
//                   {isAdminChat ? "Contact an administrator" : "Start a new chat"}
//                 </button>
//               </div>
//             ) : (
//               chats.map((chat) => {
//                 if (!chat || !chat.id) return null; // Add null check for chat object
//                 const otherUser = getOtherParticipant(chat);
//                 const avatarColor = getRandomColor(otherUser.name, otherUser.isAdmin);

//                 return (
//                   <li
//                     key={chat.id}
//                     className={`
//                       p-4 cursor-pointer hover:bg-gray-50 transition-colors
//                       ${chat.isBlocked ? "opacity-70" : ""}
//                       ${selectedChat?.id === chat.id ? "bg-blue-50" : ""}
//                     `}
//                     onClick={() => handleChatSelect(chat)}
//                   >
//                     <div className="flex items-center">
//                       <div className="relative">
//                         <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white shadow-sm`}>
//                           {getInitials(otherUser.name)}
//                         </div>
//                         {chat.unreadCount > 0 && (
//                           <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-sm">
//                             {chat.unreadCount}
//                           </div>
//                         )}
//                         {chat.isBlocked && (
//                           <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
//                             <Lock size={12} />
//                           </div>
//                         )}
//                         {!chat.adminApproved && !chat.isBlocked && (
//                           <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
//                             <Clock size={12} />
//                           </div>
//                         )}
//                         <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${otherUser.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//                       </div>
//                       <div className="ml-4 flex-1 min-w-0">
//                         <div className="flex justify-between items-center">
//                           <div className="flex items-center">
//                             <h3 className="font-medium text-gray-900 truncate">{otherUser.name}</h3>
//                             {otherUser.isAdmin && (
//                               <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-sm font-medium">
//                                 Admin
//                               </span>
//                             )}
//                           </div>
//                           {chat.lastMessage && (
//                             <span className="text-xs text-gray-500 whitespace-nowrap">
//                               {formatTime(chat.lastMessage.createdAt)}
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           {chat.lastMessage && chat.lastMessage.senderId === user?.id && (
//                             <CheckCheck size={14} className="text-gray-400 min-w-max" />
//                           )}
//                           <p className="text-sm text-gray-600 truncate">
//                             {console.log("clg",chats)}
//                             {chat.isBlocked
//                               ? "This conversation has been blocked"
//                               : !chat.adminApproved && user?.role !== 'ADMIN'
//                               ? "Waiting for admin approval..."
//                               : chat.lastMessage && chat.lastMessage.content
//                               ? chat.lastMessage.content
//                               : "No messages yet"}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })
//             )}
//           </ul>
//         )}
//       </div>

//       {/* Chat Window */}
//       <div className="flex-1 flex flex-col bg-gray-50 relative">
//         {/* Mobile Header with menu button - only visible on mobile */}
//         <div className="md:hidden sticky top-0 z-20 p-3 bg-white border-b shadow-sm flex items-center gap-2">
//           <button
//             className="text-gray-600 p-1"
//             onClick={() => setMobileMenuOpen(true)}
//           >
//             <Menu size={24} />
//           </button>
//           {selectedChat && (
//             <button
//               onClick={() => setSelectedChat(null)}
//               className="flex items-center text-blue-500 gap-1"
//             >
//               <ChevronLeft size={16} />
//               <span>Back</span>
//             </button>
//           )}
//         </div>

//         {selectedChat ? (
//           <>
//             {/* Admin approval banner */}
//             {selectedChat && !selectedChat.adminApproved && user?.role === 'ADMIN' && (
//               <div className="sticky top-0 z-30 p-3 bg-yellow-50 border-b border-yellow-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2 text-yellow-700">
//                     <AlertCircle size={18} />
//                     <span>New conversation request from {getOtherParticipant(selectedChat).name}</span>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={handleApproveChat}
//                       className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={handleBlockChat}
//                       className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
//                     >
//                       Block
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* User waiting for approval banner */}
//             {selectedChat && !selectedChat.adminApproved && user?.role !== 'ADMIN' && (
//               <div className="sticky top-0 z-30 p-3 bg-yellow-50 border-b border-yellow-200">
//                 <div className="flex items-center gap-2 text-yellow-700">
//                   <Clock size={18} />
//                   <span>Waiting for admin approval. You'll be notified when you can send messages.</span>
//                 </div>
//               </div>
//             )}

//             {/* Blocked chat banner */}
//             {selectedChat && selectedChat.isBlocked && (
//               <div className="sticky top-0 z-30 p-3 bg-red-50 border-b border-red-200">
//                 <div className="flex items-center gap-2 text-red-700">
//                   <Lock size={18} />
//                   <span>This conversation has been blocked by an administrator.</span>
//                 </div>
//               </div>
//             )}

//             {/* Chat Header */}
//             <div className="sticky top-0 md:top-0 z-10 p-4 bg-white border-b shadow-sm flex items-center">
//               <div className={`w-10 h-10 rounded-full ${getRandomColor(getOtherParticipant(selectedChat).name, getOtherParticipant(selectedChat).isAdmin)} flex items-center justify-center text-white shadow-sm`}>
//                 {getInitials(getOtherParticipant(selectedChat).name)}
//               </div>
//               <div className="ml-3">
//                 <div className="flex items-center">
//                   <h3 className="font-medium text-gray-900">
//                     {getOtherParticipant(selectedChat).name}
//                   </h3>
//                   {getOtherParticipant(selectedChat).isAdmin && (
//                     <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-sm font-medium flex items-center gap-1">
//                       <Shield size={10} />
//                       <span>Admin</span>
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-500 flex items-center gap-1">
//                   {Object.values(typingUsers).length > 0 ? (
//                     <>
//                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                       <span>{Object.values(typingUsers).join(", ")} typing...</span>
//                     </>
//                   ) : getOtherParticipant(selectedChat).isOnline ? (
//                     <>
//                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                       <span>Online</span>
//                     </>
//                   ) : (
//                     <>
//                       <Clock size={12} />
//                       <span>Last seen recently</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-6">
//               {loading ? (
//                 <div className="flex justify-center items-center h-full">
//                   <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
//                 </div>
//               ) : messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-center p-4">
//                   <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                     <MessageCircle size={24} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-700 mb-1">No messages yet</h3>
//                   <p className="text-gray-500 mb-4">
//                     {isBlocked
//                       ? "This conversation has been blocked by an administrator."
//                       : needsApproval
//                       ? "Please wait for an administrator to approve this conversation."
//                       : `Start the conversation with ${getOtherParticipant(selectedChat).name}`}
//                   </p>
//                   {!isBlocked && !needsApproval && (
//                     <div className="w-full max-w-xs">
//                       <input
//                         type="text"
//                         value={messageInput}
//                         onChange={(e) => setMessageInput(e.target.value)}
//                         placeholder="Type a message..."
//                         className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" && !e.shiftKey) {
//                             e.preventDefault();
//                             handleSendMessage(e);
//                           }
//                         }}
//                       />
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {groupedMessages.map((group, groupIndex) => (
//                     <div key={groupIndex} className="space-y-3">
//                       <div className="flex justify-center">
//                         <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
//                           {group.date}
//                         </div>
//                       </div>

//                       {group.messages.map((message, messageIndex) => {
//                         if (!message || !message.sender) return null; // Add null check for message
//                         const isCurrentUser = message.sender.id === user?.id;
//                         const showAvatar = messageIndex === 0 ||
//                                           (group.messages[messageIndex-1]?.sender?.id !== message.sender?.id);
//                         const isFromAdmin = !isCurrentUser && getOtherParticipant(selectedChat).isAdmin;
//                         const avatarColor = getRandomColor(message.sender?.name || "Unknown", isFromAdmin);

//                         return (
//                           <div
//                             key={message.id || `msg-${messageIndex}`}
//                             className={`flex ${
//                               isCurrentUser ? "justify-end" : "justify-start"
//                             }`}
//                           >
//                             {!isCurrentUser && showAvatar && (
//                               <div className="flex-shrink-0 mr-2">
//                                 <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs`}>
//                                   {getInitials(message.sender?.name)}
//                                 </div>
//                               </div>
//                             )}

//                             <div
//                               className={`
//                                 max-w-xs sm:max-w-sm md:max-w-md rounded-lg px-4 py-2 shadow-sm
//                                 ${
//                                   isCurrentUser
//                                     ? "bg-blue-500 text-white rounded-br-none"
//                                     : isFromAdmin
//                                       ? "bg-blue-100 text-gray-800 rounded-bl-none"
//                                       : "bg-white text-gray-800 rounded-bl-none"
//                                 }
//                               `}
//                             >
//                               <div className="mb-1">
//                                 {!isCurrentUser && showAvatar && (
//                                   <span className="font-medium text-xs text-gray-500">
//                                     {message.sender?.name || "Unknown"}
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="break-words">{message.content}</p>
//                               <div className="text-right mt-1">
//                                 <span className={`text-xs ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
//                                   {message.createdAt ? formatTime(message.createdAt) : ""}
//                                   {isCurrentUser && (
//                                     <CheckCheck size={12} className="inline ml-1" />
//                                   )}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ))}
//                   <div ref={messageEndRef} />
//                 </div>
//               )}
//             </div>

//             {/* Message Input */}
//             <div className="sticky bottom-0 p-4 bg-white border-t shadow-md">
//               <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//                 <input
//                   ref={messageInputRef}
//                   type="text"
//                   value={messageInput}
//                   onChange={(e) => setMessageInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     // Don't handle typing for blocked or unapproved chats (unless admin)
//                     if (isBlocked || (needsApproval && user?.role !== 'ADMIN')) return;

//                     // Handle typing indication
//                     handleTyping();

//                     // Send message when Enter key is pressed
//                     if (e.key === "Enter" && !e.shiftKey) {
//                       e.preventDefault(); // Prevent default form submission
//                       handleSendMessage(e);
//                     }
//                   }}
//                   placeholder={
//                     isBlocked
//                       ? "This conversation has been blocked"
//                       : needsApproval
//                       ? "Waiting for admin approval..."
//                       : "Type a message..."
//                   }
//                   className={`
//                     flex-1 py-3 px-4 border border-gray-300 rounded-full
//                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                     ${(isBlocked || needsApproval) && user?.role !== 'ADMIN' ? "bg-gray-100 cursor-not-allowed" : ""}
//                   `}
//                   disabled={(isBlocked || needsApproval) && user?.role !== 'ADMIN'}
//                 />
//                 <button
//                   type="submit"
//                   disabled={!messageInput.trim() || ((isBlocked || needsApproval) && user?.role !== 'ADMIN')}
//                   className={`
//                     p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//                     ${
//                       !messageInput.trim() || ((isBlocked || needsApproval) && user?.role !== 'ADMIN')
//                         ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : "bg-blue-500 text-white hover:bg-blue-600"
//                     }
//                     transition-colors
//                   `}
//                 >
//                   <Send size={20} />
//                 </button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full p-4 text-center">
//             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
//               <MessageCircle size={40} className="text-blue-500" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">{pageTitle}</h2>
//             <p className="text-gray-500 mb-6 max-w-md">
//               {isAdminChat
//                 ? "Contact our administrators for assistance with your account or services"
//                 : "Send private messages to friends and start conversations"
//               }
//             </p>
//             <button
//               onClick={handleNewChatClick}
//               className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium flex items-center gap-2"
//             >
//               <Plus size={20} />
//               <span>{isAdminChat ? "Contact Administrator" : "New Message"}</span>
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Connection Status */}
//       {!connected && (
//         <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
//           <span className="w-2 h-2 bg-white rounded-full"></span>
//           <span>Disconnected from server</span>
//         </div>
//       )}

//       {/* Chat Modals */}
//       {isAdminChat ? (
//         <AdminContactModal
//           isOpen={isAdminContactModalOpen}
//           onClose={() => setIsAdminContactModalOpen(false)}
//           onChatCreated={handleNewChatCreated}
//         />
//       ) : (
//         <NewChatModal
//           isOpen={isNewChatModalOpen}
//           onClose={() => setIsNewChatModalOpen(false)}
//           onChatCreated={handleNewChatCreated}
//         />
//       )}

//       {/* Error toast */}
//       {error && (
//         <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
//           <AlertCircle size={20} />
//           <div>
//             <p>{error}</p>
//             <button
//               className="text-xs underline"
//               onClick={() => setError(null)}
//             >
//               Dismiss
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chat;

// // src/pages/Chat.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { format } from "date-fns";
// import { useSocket } from "../Context/SocketContext";
// import { useAuth } from "../Context/AuthContext";
// import NewChatModal from "../components/modals/NewChatModal";
// import chatService from "../services/chatServices";
// // Import icons
// import {
//   Send,
//   Menu,
//   X,
//   Plus,
//   MessageCircle,
//   User,
//   ChevronLeft,
//   CheckCheck,
//   Clock
// } from "lucide-react";

// const Chat = () => {
//   const { socket, connected, onlineUsers, getOnlineStatus } = useSocket();
//   const { user } = useAuth();
//   const [chats, setChats] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [typingUsers, setTypingUsers] = useState({});
//   const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const messageEndRef = useRef(null);
//   const messageInputRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   // Fetch chats when component mounts or when socket connects
//   useEffect(() => {
//     if (connected) {
//       fetchChats();
//     }
//   }, [connected]);

//   // Setup socket event listeners
//   useEffect(() => {
//     if (!socket || !connected) return;

//     const handleNewMessage = (message) => {
//       if (selectedChat && selectedChat.id === message.chatId) {
//         setMessages((prevMessages) => [...prevMessages, message]);
//         // Mark as read if we're currently viewing this chat
//         socket.emit("mark-read", { chatId: message.chatId });
//       }
//       // Update unread count in chat list
//       updateChatUnreadCount(message.chatId);
//     };

//     const handleUnreadUpdate = ({ chatId }) => {
//       updateChatUnreadCount(chatId);
//     };

//     const handleUserTyping = ({ chatId, userId, userName }) => {
//       if (selectedChat && selectedChat.id === chatId) {
//         setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
//       }
//     };

//     const handleUserStopTyping = ({ chatId, userId }) => {
//       if (selectedChat && selectedChat.id === chatId) {
//         setTypingUsers((prev) => {
//           const updated = { ...prev };
//           delete updated[userId];
//           return updated;
//         });
//       }
//     };

//     const handleSocketError = (error) => {
//       console.error("Socket error:", error);
//       setError(error.message);
//     };

//     // Register event listeners
//     socket.on("new-message", handleNewMessage);
//     socket.on("unread-update", handleUnreadUpdate);
//     socket.on("user-typing", handleUserTyping);
//     socket.on("user-stop-typing", handleUserStopTyping);
//     socket.on("error", handleSocketError);

//     // Cleanup on unmount or when dependencies change
//     return () => {
//       socket.off("new-message", handleNewMessage);
//       socket.off("unread-update", handleUnreadUpdate);
//       socket.off("user-typing", handleUserTyping);
//       socket.off("user-stop-typing", handleUserStopTyping);
//       socket.off("error", handleSocketError);
//     };
//   }, [socket, connected, selectedChat]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Focus input when chat changes
//   useEffect(() => {
//     if (selectedChat) {
//       messageInputRef.current?.focus();
//       // Close mobile menu when chat is selected
//       setMobileMenuOpen(false);
//     }
//   }, [selectedChat]);

//   // Request online status for users in chats
//   useEffect(() => {
//     // When chats change, request online status for all users
//     if (socket && connected && chats.length > 0) {
//       // Extract all user IDs from chats
//       const userIds = new Set();

//       chats.forEach(chat => {
//         // Add participants
//         if (chat.participants && Array.isArray(chat.participants)) {
//           chat.participants.forEach(participant => {
//             if (participant && participant.id) {
//               userIds.add(participant.id);
//             }
//           });
//         }

//         // Add message senders
//         if (chat.lastMessage && chat.lastMessage.senderId) {
//           userIds.add(chat.lastMessage.senderId);
//         }
//       });

//       // Request online status if we have any user IDs
//       if (userIds.size > 0) {
//         getOnlineStatus(Array.from(userIds));
//       }
//     }
//   }, [chats, socket, connected, getOnlineStatus]);

//   const fetchChats = async () => {
//     try {
//       setLoading(true);
//       const data = await chatService.getUserChats();
//       setChats(data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//       setError(err.message || "Failed to load chats");
//       setLoading(false);
//     }
//   };

//   const fetchMessages = async (chatId) => {
//     try {
//       setLoading(true);
//       const data = await chatService.getChatById(chatId);

//       if (!data) {
//         throw new Error("No data returned from server");
//       }

//       setSelectedChat(data);

//       // Check if messages property exists and is an array
//       if (!data.messages || !Array.isArray(data.messages)) {
//         console.warn("Chat data doesn't contain messages array:", data);
//         setMessages([]);
//       } else {
//         // Process messages to ensure they have a valid sender
//         const processedMessages = data.messages.map(msg => {
//           // If message doesn't have a sender but has senderId, create sender object
//           if (!msg.sender && msg.senderId) {
//             return {
//               ...msg,
//               sender: {
//                 id: msg.senderId,
//                 name: `User ${msg.senderId.substring(0, 5)}`
//               }
//             };
//           }
//           return msg;
//         });

//         setMessages(processedMessages);
//       }

//       // Mark messages as read
//       if (socket && connected) {
//         socket.emit("mark-read", { chatId });
//       }

//       // Also mark as read through API
//       await chatService.markAsRead(chatId);

//       // Update unread count in UI
//       updateChatUnreadCount(chatId, 0);

//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching messages:", err);
//       setError(err.message || "Failed to load messages");
//       setLoading(false);
//     }
//   };

//   const updateChatUnreadCount = (chatId, count = null) => {
//     setChats((prevChats) =>
//       prevChats.map((chat) => {
//         if (chat.id === chatId) {
//           // If count is provided, use it, otherwise increment
//           const newCount = count !== null ? count : chat.unreadCount + 1;
//           return { ...chat, unreadCount: newCount };
//         }
//         return chat;
//       })
//     );
//   };

//   const handleChatSelect = (chat) => {
//     if (!chat || !chat.id) return; // Add null check before selecting chat
//     setSelectedChat(chat);
//     fetchMessages(chat.id);
//   };

//   const handleNewChatCreated = (newChat) => {
//     // Add the new chat to our list and select it
//     setChats((prevChats) => [newChat, ...prevChats]);
//     setSelectedChat(newChat);
//     fetchMessages(newChat.id);
//   };

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!messageInput.trim() || !selectedChat || !socket || !connected) return;

//     // Emit message to socket
//     socket.emit("send-message", {
//       chatId: selectedChat.id,
//       content: messageInput,
//     });

//     // Clear input
//     setMessageInput("");

//     // Clear typing indicator
//     handleStopTyping();
//   };

//   const handleTyping = () => {
//     if (!selectedChat || !socket || !connected) return;

//     // Send typing indicator
//     socket.emit("typing", { chatId: selectedChat.id });

//     // Clear previous timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Set new timeout
//     typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
//   };

//   const handleStopTyping = () => {
//     if (!selectedChat || !socket || !connected) return;
//     socket.emit("stop-typing", { chatId: selectedChat.id });
//   };

//   const getOtherParticipant = (chat) => {

//     // Check if chat has participants array with entries
//     if (!chat || !chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) {
//       // If we have a lastMessage with senderId, we can use that to create a basic user object
//       if (chat?.lastMessage?.senderId) {
//         const userId = chat.lastMessage.senderId;

//         return {
//           id: userId,
//           name: `User ${userId.substring(0, 5)}`,
//           isOnline: !!onlineUsers[userId]
//         };
//       }
//       return { name: "Unknown User", id: "unknown", isOnline: false };
//     }

//     // Try to find a participant that isn't the current user
//     const otherParticipants = chat.participants.filter(participant => {
//       // Notice we're checking userId, not id
//       return participant && participant.userId !== user?.id;
//     });

//     // If we found another participant, return it with online status
//     if (otherParticipants.length > 0) {
//       const otherParticipant = otherParticipants[0];

//       return {
//         id: otherParticipant.userId|| otherParticipant.id,
//         name: otherParticipant?.name || otherParticipant?.user?.name ||`User ${otherParticipant.id}`,
//         isOnline: !!onlineUsers[otherParticipant.id]
//       };
//     }

//     // If all else fails, return the first participant
//     if (chat.participants[0]) {
//       const firstParticipant = chat.participants[0];

//       return {
//         id: firstParticipant.userId,
//         name: firstParticipant.user?.name || `User ${firstParticipant.id.substring(0, 5)}`,
//         isOnline: !!onlineUsers[firstParticipant.userId]
//       };
//     }

//     return { name: "Unknown User", id: "unknown", isOnline: false };
//   };

//   const formatTime = (dateString) => {
//     return format(new Date(dateString), "h:mm a");
//   };

//   const formatDate = (dateString) => {
//     const today = new Date();
//     const messageDate = new Date(dateString);

//     if (messageDate.toDateString() === today.toDateString()) {
//       return "Today";
//     }

//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     if (messageDate.toDateString() === yesterday.toDateString()) {
//       return "Yesterday";
//     }

//     return format(messageDate, "MMM d, yyyy");
//   };

//   const getInitials = (name) => {

//     if (!name) return "U";
//     return name
//       .split(" ")
//       .map((part) => part[0])
//       .join("")
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   const getRandomColor = (name) => {
//     const colors = [
//       "bg-blue-500", "bg-green-500", "bg-purple-500",
//       "bg-pink-500", "bg-indigo-500", "bg-teal-500",
//       "bg-orange-500", "bg-cyan-500", "bg-emerald-500"
//     ];

//     // Use the name to generate a consistent color
//     let hash = 0;
//     for (let i = 0; i < name?.length || 0; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }

//     return colors[Math.abs(hash) % colors.length];
//   };

//   // Group messages by date
//   const groupMessagesByDate = (messages) => {
//     if (!messages || !Array.isArray(messages)) {
//       return [];
//     }

//     const groups = {};

//     messages.forEach(message => {
//       if (!message || !message.createdAt) return;

//       const date = formatDate(message.createdAt);
//       if (!groups[date]) {
//         groups[date] = [];
//       }
//       groups[date].push(message);
//     });

//     return Object.entries(groups).map(([date, messages]) => ({
//       date,
//       messages
//     }));
//   };

//   const groupedMessages = groupMessagesByDate(messages);

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar - hidden on mobile when chat is selected unless menu is open */}
//       <div
//         className={`
//           ${mobileMenuOpen ? "fixed inset-0 z-50 bg-white" : "hidden md:block"}
//           w-full md:w-80 lg:w-96 border-r bg-white overflow-y-auto
//         `}
//       >
//         <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center shadow-sm">
//           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//             <MessageCircle size={20} className="text-blue-500" />
//             <span>Messages</span>
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setIsNewChatModalOpen(true)}
//               className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               title="New Conversation"
//             >
//               <Plus size={20} />
//             </button>
//             <button
//               className="md:hidden p-2 text-gray-500"
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {loading && chats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-40 p-4">
//             <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mb-4"></div>
//             <p className="text-gray-500">Loading conversations...</p>
//           </div>
//         ) : (
//           <ul className="divide-y divide-gray-200">
//             {chats.length === 0 ? (
//               <div className="flex flex-col items-center justify-center p-8 text-center">
//                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                   <MessageCircle size={24} className="text-gray-400" />
//                 </div>
//                 <p className="text-gray-500 mb-1">No conversations yet</p>
//                 <button
//                   onClick={() => setIsNewChatModalOpen(true)}
//                   className="text-blue-500 font-medium hover:underline"
//                 >
//                   Start a new chat
//                 </button>
//               </div>
//             ) : (
//               chats.map((chat) => {
//                 if (!chat || !chat.id) return null; // Add null check for chat object
//                 const otherUser = getOtherParticipant(chat);

//                 const avatarColor = getRandomColor(otherUser.name);
//                 return (
//                   <li
//                     key={chat.id}
//                     className={`
//                       p-4 cursor-pointer hover:bg-gray-50 transition-colors
//                       ${selectedChat?.id === chat.id ? "bg-blue-50" : ""}
//                     `}
//                     onClick={() => handleChatSelect(chat)}
//                   >
//                     <div className="flex items-center">
//                       <div className="relative">
//                         <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white shadow-sm`}>
//                           {getInitials(otherUser.name)}
//                         </div>
//                         {chat.unreadCount > 0 && (
//                           <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-sm">
//                             {chat.unreadCount}
//                           </div>
//                         )}
//                         <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${otherUser.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//                       </div>
//                       <div className="ml-4 flex-1 min-w-0">
//                         <div className="flex justify-between items-center">
//                           <h3 className="font-medium text-gray-900 truncate">{otherUser.name}</h3>
//                           {chat.lastMessage && (
//                             <span className="text-xs text-gray-500 whitespace-nowrap">
//                               {formatTime(chat.lastMessage.createdAt)}
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           {chat.lastMessage && chat.lastMessage.senderId === user?.id && (
//                             <CheckCheck size={14} className="text-gray-400 min-w-max" />
//                           )}
//                           <p className="text-sm text-gray-600 truncate">
//                             {chat.lastMessage && chat.lastMessage.content
//                               ? chat.lastMessage.content
//                               : "No messages yet"}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })
//             )}
//           </ul>
//         )}
//       </div>

//       {/* Chat Window */}
//       <div className="flex-1 flex flex-col bg-gray-50 relative">
//         {/* Mobile Header with menu button - only visible on mobile */}
//         <div className="md:hidden sticky top-0 z-20 p-3 bg-white border-b shadow-sm flex items-center gap-2">
//           <button
//             className="text-gray-600 p-1"
//             onClick={() => setMobileMenuOpen(true)}
//           >
//             <Menu size={24} />
//           </button>
//           {selectedChat && (
//             <button
//               onClick={() => setSelectedChat(null)}
//               className="flex items-center text-blue-500 gap-1"
//             >
//               <ChevronLeft size={16} />
//               <span>Back</span>
//             </button>
//           )}
//         </div>

//         {selectedChat ? (
//           <>
//             {/* Chat Header */}
//             <div className="sticky top-0 md:top-0 z-10 p-4 bg-white border-b shadow-sm flex items-center">
//               <div className={`w-10 h-10 rounded-full ${getRandomColor(getOtherParticipant(selectedChat).name)} flex items-center justify-center text-white shadow-sm`}>
//                 {getInitials(getOtherParticipant(selectedChat).name)}
//               </div>
//               <div className="ml-3">
//                 <h3 className="font-medium text-gray-900">
//                   {getOtherParticipant(selectedChat).name}
//                 </h3>
//                 <div className="text-xs text-gray-500 flex items-center gap-1">
//                   {Object.values(typingUsers).length > 0 ? (
//                     <>
//                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                       <span>{Object.values(typingUsers).join(", ")} typing...</span>
//                     </>
//                   ) : getOtherParticipant(selectedChat).isOnline ? (
//                     <>
//                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                       <span>Online</span>
//                     </>
//                   ) : (
//                     <>
//                       <Clock size={12} />
//                       <span>Last seen recently</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-6">
//               {loading ? (
//                 <div className="flex justify-center items-center h-full">
//                   <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
//                 </div>
//               ) : messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-center p-4">
//                   <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                     <MessageCircle size={24} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-700 mb-1">No messages yet</h3>
//                   <p className="text-gray-500 mb-4">Start the conversation with {getOtherParticipant(selectedChat).name}</p>
//                   <div className="w-full max-w-xs">
//                     <input
//                       type="text"
//                       value={messageInput}
//                       onChange={(e) => setMessageInput(e.target.value)}
//                       placeholder="Type a message..."
//                       className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter" && !e.shiftKey) {
//                           e.preventDefault();
//                           handleSendMessage(e);
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {groupedMessages.map((group, groupIndex) => (
//                     <div key={groupIndex} className="space-y-3">
//                       <div className="flex justify-center">
//                         <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
//                           {group.date}
//                         </div>
//                       </div>

//                       {group.messages.map((message, messageIndex) => {
//                         if (!message || !message.sender) return null; // Add null check for message
//                         const isCurrentUser = message.sender.id === user?.id;
//                         const showAvatar = messageIndex === 0 ||
//                                           (group.messages[messageIndex-1]?.sender?.id !== message.sender?.id);
//                         const avatarColor = getRandomColor(message.sender?.name || "Unknown");

//                         return (
//                           <div
//                             key={message.id || `msg-${messageIndex}`}
//                             className={`flex ${
//                               isCurrentUser ? "justify-end" : "justify-start"
//                             }`}
//                           >
//                             {!isCurrentUser && showAvatar && (
//                               <div className="flex-shrink-0 mr-2">
//                                 <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs`}>
//                                   {getInitials(message.sender?.name)}
//                                 </div>
//                               </div>
//                             )}

//                             <div
//                               className={`
//                                 max-w-xs sm:max-w-sm md:max-w-md rounded-lg px-4 py-2 shadow-sm
//                                 ${
//                                   isCurrentUser
//                                     ? "bg-blue-500 text-white rounded-br-none"
//                                     : "bg-white text-gray-800 rounded-bl-none"
//                                 }
//                               `}
//                             >
//                               <div className="mb-1">
//                                 {!isCurrentUser && showAvatar && (
//                                   <span className="font-medium text-xs text-gray-500">
//                                     {message.sender?.name || "Unknown"}
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="break-words">{message.content}</p>
//                               <div className="text-right mt-1">
//                                 <span className={`text-xs ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
//                                   {message.createdAt ? formatTime(message.createdAt) : ""}
//                                   {isCurrentUser && (
//                                     <CheckCheck size={12} className="inline ml-1" />
//                                   )}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ))}
//                   <div ref={messageEndRef} />
//                 </div>
//               )}
//             </div>

//             {/* Message Input */}
//             <div className="sticky bottom-0 p-4 bg-white border-t shadow-md">
//               <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//                 <input
//                   ref={messageInputRef}
//                   type="text"
//                   value={messageInput}
//                   onChange={(e) => setMessageInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     // Handle typing indication
//                     handleTyping();

//                     // Send message when Enter key is pressed
//                     if (e.key === "Enter" && !e.shiftKey) {
//                       e.preventDefault(); // Prevent default form submission
//                       handleSendMessage(e);
//                     }
//                   }}
//                   placeholder="Type a message..."
//                   className="flex-1 py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <button
//                   type="submit"
//                   disabled={!messageInput.trim()}
//                   className={`
//                     p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//                     ${messageInput.trim() ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400"}
//                     transition-colors
//                   `}
//                 >
//                   <Send size={20} />
//                 </button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full p-4 text-center">
//             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
//               <MessageCircle size={40} className="text-blue-500" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h2>
//             <p className="text-gray-500 mb-6 max-w-md">
//               Send private messages to friends and start conversations
//             </p>
//             <button
//               onClick={() => setIsNewChatModalOpen(true)}
//               className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium flex items-center gap-2"
//             >
//               <Plus size={20} />
//               <span>New Message</span>
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Connection Status */}
//       {!connected && (
//         <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
//           <span className="w-2 h-2 bg-white rounded-full"></span>
//           <span>Disconnected from server</span>
//         </div>
//       )}

//       {/* New Chat Modal */}
//       <NewChatModal
//         isOpen={isNewChatModalOpen}
//         onClose={() => setIsNewChatModalOpen(false)}
//         onChatCreated={handleNewChatCreated}
//       />
//     </div>
//   );
// };

// export default Chat;
