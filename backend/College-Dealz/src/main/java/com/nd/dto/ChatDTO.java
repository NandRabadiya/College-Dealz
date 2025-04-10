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
    private String senderName;
    private String receiverName;
    private String productName;
    private int productId;
    private List<MessageDTO> messages;

    public ChatDTO() {}

    public ChatDTO(int chatId, int senderId, String senderName, int receiverId, String receiverName,
                   int productId, String productName, List<MessageDTO> messages) {
        this.chatId = chatId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverName = receiverName;
        this.productName = productName;
        this.receiverId = receiverId;
        this.productId = productId;
        this.messages = messages;
    }

}
