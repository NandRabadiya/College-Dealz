package com.nd.service;

import com.nd.entities.Image;
import com.nd.repositories.ImageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class S3ImageService {

    private final S3Client s3Client;
    private final ImageRepo imageRepository;

    private final String bucketName = "college-dealz-images";
    private final String region = "ap-south-1"; // used in URL


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

    public List<String> uploadImages(List<MultipartFile> files) throws IOException {
        List<String> urls = new ArrayList<>();

        for (MultipartFile file : files) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
            urls.add(s3Url);
        }

        return urls;
    }

    public void deleteImage(String fileName) {
        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        s3Client.deleteObject(deleteRequest);
    }

    public void deleteImages(List<String> fileNames) {
        if (fileNames == null || fileNames.isEmpty()) return;

        for (String fileName : fileNames) {
            try {
                s3Client.deleteObject(builder -> builder
                        .bucket(bucketName)
                        .key(fileName)
                        .build());
                System.out.println("Deleted from S3: " + fileName);
            } catch (Exception e) {
                System.err.println("Failed to delete " + fileName + " from S3: " + e.getMessage());
            }
        }
    }




}
