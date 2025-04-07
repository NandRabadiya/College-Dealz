package com.nd.service;

import com.nd.dto.MessageDTO;
import com.nd.entities.Message;
import com.nd.exceptions.ChatException;
import com.nd.exceptions.ProductException;
import com.nd.exceptions.UserException;

import java.util.List;

public interface MessageService {

    Message sendMessage(int senderId, int chatId, String content) throws UserException, ChatException, ProductException;
    List<Message> getMessagesByProductId(int productId) throws ProductException, ChatException;
    List<Message> getMessagesByChatId(int chatId);
    MessageDTO createMessage(int senderId, int receiverId, String content, int chatId);
}
