package com.nd.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Setter
@Getter
public class MessageDTO {
    private int senderId;
    private int receiverId;
    private int chatId;
    private String content;
    private LocalDate createdAt;
    private LocalTime createdTime;

    // Corrected Constructor
    public MessageDTO(int senderId, int receiverId, int chatId, String content, LocalDate createdAt, LocalTime createdTime) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.chatId = chatId;
        this.content = content;
        this.createdAt = createdAt;
        this.createdTime = createdTime;
    }
}
