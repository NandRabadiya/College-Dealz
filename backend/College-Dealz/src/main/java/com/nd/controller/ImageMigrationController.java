package com.nd.controller;

import com.nd.service.S3ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/migration")
@RequiredArgsConstructor
public class ImageMigrationController {


    private final S3ImageService s3ImageService;

    @PostMapping("/migrate-to-s3")
    public ResponseEntity<String> migrateImagesToS3() {
        try {
            s3ImageService.migrateImagesToS3();
            return ResponseEntity.ok("Migration to S3 completed successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Migration failed: " + e.getMessage());
        }
    }
}
