package com.nd.service;

import com.nd.dto.WantlistDto;

import java.util.List;

public interface WantlistService {


    WantlistDto addProductToWantlist(Integer userId, WantlistDto wantlistDto);
    void removeProductFromWantlist(Integer userId, Integer wantlistId , String reason);

    List<WantlistDto> getAllWantlist();
    List<WantlistDto> getAllWantlistItemsByUserId(Integer userId);


    WantlistDto getWantlistById(Integer wantlistId);

}
