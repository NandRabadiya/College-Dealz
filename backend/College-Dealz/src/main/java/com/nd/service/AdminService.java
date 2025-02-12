package com.nd.service;

import com.nd.dto.UserDto;

import java.util.List;

public interface AdminService {

    void addAdmin(int userId, String authHeader);

    void removeAdminRoleFromUser(int userId, String authHeader);

    List<UserDto> getAllAdmins();


}
