package com.nd.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ImageDto {

    private Integer id; // ID for identifying the image (if needed for updates)

    @NotNull
    private Integer productId; // ID of the associated product

    @Size(max = 255)
    @NotNull
    private String fileName; // Name of the file

    private byte[] imageData;


    @Size(max = 100)
    @NotNull
    private String contentType; // MIME type of the image

    @Size(max = 500)
    private String s3Url; // S3 URL (optional if used for cloud storage)

}
