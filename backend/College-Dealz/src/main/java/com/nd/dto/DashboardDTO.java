package com.nd.dto;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private Integer id;
    private String username;
    private String universityName;
    private String email;
    private byte[] profilePicture;
    private String provider;
    private boolean guided = false;
    private Set<String> roles;
}
