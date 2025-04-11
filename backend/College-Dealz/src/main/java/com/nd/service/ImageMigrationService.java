package com.nd.service;

import com.nd.entities.Image;
import com.nd.repositories.ImageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageMigrationService {

    private final S3Client s3Client;
    private final ImageRepo imageRepository;

    private final String bucketName = "college-dealz-images";

    public void migrateImagesToS3() {
        List<Image> images = imageRepository.findAll();

        for (Image image : images) {
            byte[] imageData = image.getImageData();
            String fileName = image.getFileName(); // e.g., fan1.jpg
            String contentType = image.getContentType();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                //    .acl("public-read") // makes the image publicly accessible
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageData));

            String s3Url = "https://" + bucketName + ".s3.amazonaws.com/" + fileName;

            // Update the entity
            image.setS3Url(s3Url);
            imageRepository.save(image);
        }
    }
}
