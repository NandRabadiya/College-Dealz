package com.nd.service;
import com.nd.dto.DashboardDTO;
import com.nd.dto.UserDto;
import com.nd.entities.User;

import java.util.List;

public interface UserService {

    UserDto registerNewUser(UserDto user);

    UserDto userToDto(User user);

    UserDto getUserById(Integer userId);

    List<UserDto> getAllUsers(String jwt);

    void deleteUser(Integer userId);

    DashboardDTO updateDashboard(int userId, DashboardDTO dashboardDTO);

    DashboardDTO getDashboard(Integer userId);


}