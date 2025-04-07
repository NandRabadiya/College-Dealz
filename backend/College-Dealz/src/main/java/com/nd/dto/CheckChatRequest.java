package com.nd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CheckChatRequest {

    private int senderId;
    private int receiverId;
    private int productId;
}
