package com.nd.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nd.entities.Provider;
import com.nd.entities.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDto {
    private String universityName;
    private int id;

    @NotEmpty
    @Size(min = 4, message = "Username must be min of 4 characters !!")
    private String name;

    @Email(message = "Email address is not valid !!")
    @NotEmpty(message = "Email is required !!")
    private String email;

    @NotEmpty
    @Size(min = 3, max = 10, message = "Password must be min of 3 chars and max of 10 chars !!")
    private String password;

    private String profilePicture;
    private boolean enabled;
    private boolean emailVerified;
    private Provider provider;
    private Set<String> roles;

    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + "', email='" + email + "', roles=" + roles + "}";
    }

    @JsonIgnore
    public String getPassword() {
        return this.password;
    }
    @JsonProperty
    public int getId() {
        return id;
    }

    @JsonProperty
    public void setId(int id) {this.id=id;}



    @JsonProperty
    public void setPassword(String password) {
        this.password=password;
    }

    @JsonProperty
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty
    public String getEmail() {
        return email;
    }
    @JsonProperty
    public void setEmail(String email) {
        this.email = email;
    }
}
