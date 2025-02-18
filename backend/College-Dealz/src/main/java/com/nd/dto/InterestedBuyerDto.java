package com.nd.dto;

import lombok.Data;

@Data
public class InterestedBuyerDto {
    private int buyerId;
    private String buyerName;
    private String buyerEmail;

    public InterestedBuyerDto(int buyerId, String buyerName, String buyerEmail) {
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
    }
}
