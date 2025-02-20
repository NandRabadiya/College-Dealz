package com.nd.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ShareProductDto {

    private int product_id;
   private  String product_name;
  private  String product_description;

   private BigDecimal product_price;

   private List<String> image_urls;

}
