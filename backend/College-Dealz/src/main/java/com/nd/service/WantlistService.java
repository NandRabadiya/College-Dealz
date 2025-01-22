package com.nd.service;

import com.nd.dto.WantlistDto;

import java.util.List;

public interface WantlistService {


    WantlistDto addProductToWantlist(Integer userId, WantlistDto wantlistDto);

    /**
     * Remove a product from the user's wantlist.
     *
     * @param userId      The ID of the user (extracted from the token).
     * @param wantlistId  The ID of the wantlist item to remove.
     */
    void removeProductFromWantlist(Integer userId, Integer wantlistId);

    /**
     * Fetch all wantlist items for a specific user.
     *
     * @param userId  The ID of the user (extracted from the token).
     * @return A list of WantlistDto for the user.
     */
    List<WantlistDto> getAllWantlistItemsByUserId(Integer userId);

}
