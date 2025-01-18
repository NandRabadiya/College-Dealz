package com.nd.controller;

import com.nd.dto.ImageDto;
import com.nd.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageService imageService;

    // Upload an image for a product
    @PostMapping("/upload/{productId}")
    public ResponseEntity<ImageDto> uploadImage(@PathVariable Integer productId,
                                                @RequestParam("image") MultipartFile imageFile) {
        ImageDto uploadedImage = imageService.uploadImage(productId, imageFile);
        return ResponseEntity.ok(uploadedImage);
    }

    // Get all images for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ImageDto>> getImagesByProductId(@PathVariable Integer productId) {
        List<ImageDto> images = imageService.getImagesByProductId(productId);
        return ResponseEntity.ok(images);
    }

    // Get a specific image by ID
    @GetMapping("/{id}")
    public ResponseEntity<ImageDto> getImageById(@PathVariable Integer id) {
        ImageDto image = imageService.getImageById(id);
        return ResponseEntity.ok(image);
    }

    // Delete an image by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImageById(@PathVariable Integer id) {
        imageService.deleteImageById(id);
        return ResponseEntity.noContent().build();
    }
}
