package com.nd.service.Impl;

import com.nd.dto.ImageDto;
import com.nd.entities.Image;
import com.nd.entities.Product;
import com.nd.repositories.ImageRepo;
import com.nd.repositories.ProductRepo;
import com.nd.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageServiceImpl implements ImageService {

    @Autowired
    private ImageRepo imageRepo;

    @Autowired
    private ProductRepo productRepo;

    @Override
    public ImageDto uploadImage(Integer productId, MultipartFile imageFile) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        String fileName = imageFile.getOriginalFilename();

        Image image = new Image();
        image.setProduct(product);
        image.setFileName(fileName);
        image.setContentType(imageFile.getContentType());
        try {
            image.setImageData(imageFile.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Error processing image file", e);
        }

        image.setCreatedAt(Instant.now());
        image.setUpdatedAt(Instant.now());

        Image savedImage = imageRepo.save(image);
        return toDto(savedImage);
    }

    @Override
    public List<ImageDto> getImagesByProductId(Integer productId) {
        List<Image> images = imageRepo.findByProductId(productId);
        return images.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ImageDto getImageById(Integer id) {
        Image image = imageRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));
        return toDto(image);
    }

    @Override
    public void deleteImageById(Integer id) {
        if (!imageRepo.existsById(id)) {
            throw new RuntimeException("Image not found with ID: " + id);
        }
        imageRepo.deleteById(id);
    }

    // Convert Entity to DTO
    private ImageDto toDto(Image image) {
        ImageDto dto = new ImageDto();
        dto.setId(image.getId());
        dto.setProductId(image.getProduct().getId());
        dto.setFileName(image.getFileName());
        dto.setContentType(image.getContentType());
        dto.setS3Url(image.getS3Url());
        dto.setImageData(image.getImageData());
        return dto;
    }
}
