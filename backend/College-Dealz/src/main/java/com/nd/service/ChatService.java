package com.nd.service;

import com.nd.dto.ChatDTO;

import java.util.List;

public interface ChatService {
    ChatDTO createChat(ChatDTO chatDTO);
    ChatDTO getChatById(int chatId);
    List<ChatDTO> getChatsBySenderId(int senderId);
    List<ChatDTO> getChatsByReceiverId(int receiverId);
    List<ChatDTO> getChatsByProductId(int productId);
    void deleteChat(int chatId);
}
