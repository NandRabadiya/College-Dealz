package com.nd.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class MessageDTO {
    private int senderId;
    private int receiverId;
    private int chatId;
    private String content;
    private LocalDateTime timestamp;

    // Corrected Constructor
    public MessageDTO(int senderId, int receiverId, int chatId, String content, LocalDateTime timestamp) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.chatId = chatId;
        this.content = content;
        this.timestamp = timestamp;
    }
}
