package com.nd.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ChatDTO {
    // Getters and Setters
    private int chatId;
    private int senderId;
    private int receiverId;
    private int productId;
    private List<MessageDTO> messages;

    public ChatDTO() {}

    public ChatDTO(int chatId, int senderId, int receiverId, int productId, List<MessageDTO> messages) {
        this.chatId = chatId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.productId = productId;
        this.messages = messages;
    }

}
