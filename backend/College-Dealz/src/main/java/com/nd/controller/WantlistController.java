package com.nd.controller;

import com.nd.dto.WantlistDto;
import com.nd.service.JwtService;
import com.nd.service.WantlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wantlist")
@RequiredArgsConstructor
public class WantlistController {

    private final WantlistService wantlistService;


    private final JwtService jwtService;
    @PostMapping("/add")
    public ResponseEntity<WantlistDto> addProductToWantlist(
            @RequestHeader("Authorization") String token,
            @RequestBody WantlistDto wantlistDto) {
        Integer userId = extractUserIdFromToken(token);
        WantlistDto savedWantlist = wantlistService.addProductToWantlist(userId, wantlistDto);
        return ResponseEntity.ok(savedWantlist);
    }

    @DeleteMapping("/remove/{wantlistId}")
    public ResponseEntity<String> removeProductFromWantlist(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer wantlistId) {
        Integer userId = extractUserIdFromToken(token);
        wantlistService.removeProductFromWantlist(userId, wantlistId);
        return ResponseEntity.ok("Product removed from wantlist successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<WantlistDto>> getAllWantlistItems(
            @RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        List<WantlistDto> wantlistItems = wantlistService.getAllWantlistItemsByUserId(userId);
        return ResponseEntity.ok(wantlistItems);
    }

    @GetMapping("/{product_id}")
    public ResponseEntity<WantlistDto> getProductById(@PathVariable Integer product_id) {

        WantlistDto wantlistDto = wantlistService.getWantlistById(product_id);

        return ResponseEntity.ok(wantlistDto);

    }
    private Integer extractUserIdFromToken(String token) {

        return jwtService.getUserIdFromToken(token);
    }
}
