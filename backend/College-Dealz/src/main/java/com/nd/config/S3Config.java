package com.nd.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class S3Config {

@Value("${AWS_ACCESS_KEY}")
    private String accessKeyId;

    @Value("${AWS_SECRET_KEY}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(
                                        accessKeyId, secretAccessKey
                                )
                        )
                )
                // Add this option to force path-style access
                .serviceConfiguration(b -> b.pathStyleAccessEnabled(true))
                .build();
    }

}

