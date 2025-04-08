import axios from "axios";
import { API_BASE_URL } from "../Api/api";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  },
});

export const chatService = {
  // Get all chats for a user
  getUserChats: async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chats/user/${userId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user chats:", error);
      throw error;
    }
  },

  // Check if a chat exists between users for a product
  checkChatExists: async (senderId, receiverId, productId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chats/check`,
        {
          senderId,
          receiverId,
          productId,
        },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error checking chat:", error);
      throw error;
    }
  },

  // Create a new chat
  createChat: async (senderId, receiverId, productId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chats/create`,
        {
          senderId,
          receiverId,
          productId,
        },
       getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  },

  // Get chat by id
  getChatById: async (chatId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chats/${chatId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      throw error;
    }
  },
};
