package com.nd.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class MessageDTO {
    // Getters and Setters
    private int id;
    private int chatId;
    private int senderId;
    private String content;
    private LocalDateTime timestamp;

    public MessageDTO() {
    }

    public MessageDTO(int id, int chatId, int senderId, String content, LocalDateTime timestamp) {
        this.id = id;
        this.chatId = chatId;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
    }

}
