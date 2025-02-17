package com.nd.service;

import com.nd.dto.ImageDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageService {
    ImageDto uploadImage(Integer productId, MultipartFile imageFile);
    List<ImageDto> getImagesByProductId(Integer productId);
    ImageDto getImageById(Integer id);
    void deleteImageById(Integer id);
}
