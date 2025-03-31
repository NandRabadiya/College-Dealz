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

    public MessageDTO(int id, int id1, int id2, String content, LocalDateTime createdAt) {
    }
}
