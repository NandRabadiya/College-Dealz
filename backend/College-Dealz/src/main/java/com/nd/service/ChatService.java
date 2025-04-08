package com.nd.service;

import com.nd.dto.ChatDTO;
import com.nd.dto.CheckChatRequest;
import com.nd.dto.ProductDto;
import com.nd.dto.UserDto;
import com.nd.entities.Chat;
import com.nd.entities.Product;
import com.nd.entities.User;

import java.util.List;

public interface ChatService {
    ChatDTO createChat(ChatDTO chatDTO);
    ChatDTO getChatById(int chatId);
    List<ChatDTO> getChatsBySenderId(int senderId);
    List<ChatDTO> getChatsByReceiverId(int receiverId);
    List<ChatDTO> getChatsByProductId(int productId);
    void deleteChat(int chatId);


    
    List<ChatDTO> getAllChatsByUser(int userId);

    ChatDTO findOrCreateChat(int senderId, int receiverId, int productId);

    boolean checkChat(CheckChatRequest checkChatRequest);
}
