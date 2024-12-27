package com.nd.service;
import com.nd.dto.UserDto;

import java.util.List;
import java.util.UUID;

public interface UserService {
//    UserDto createUser(UserCreateDTO userCreateDTO);
//   UserDto updateUser(UUID userId, UserUpdateDTO userUpdateDTO);
//    UserDto getUserById(UUID userId);
//    List<UserDto> getAllUsers();
//    void deleteUser(UUID userId);
//    UserDto addRoleToUser(UUID userId, String roleName);
//    UserDto removeRoleFromUser(UUID userId, String roleName);
//    boolean verifyEmail(String token);
//    void resetPassword(String email);



    UserDto registerNewUser(UserDto user);


    UserDto createUser(UserDto user);

    UserDto updateUser(UserDto user, Integer userId);

    UserDto getUserById(Integer userId);

    List<UserDto> getAllUsers();

    void deleteUser(Integer userId);





}