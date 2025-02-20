package com.nd.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class SoldOutsideResponse {

    private int SoldPrice;
    private String Reason;
    private Date SoldDate;
    private boolean universityStudent;

}
