package com.nd.service.Impl;

import ch.qos.logback.classic.Logger;
import com.nd.dto.UserDto;
import com.nd.entities.Role;
import com.nd.entities.User;
import com.nd.repositories.RoleRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.AdminService;
import com.nd.service.JwtService;
import com.nd.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private RoleRepo roleRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    //Logger logger = null;

    @Override
    @Transactional
    public void addAdmin(int userId , String authHeader) {

        String currentAdminEmail= jwtService.getEmailFromToken(authHeader);

            // Fetch the user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User with ID " + userId + " not found."));

            // Fetch the ADMIN role
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new EntityNotFoundException("Admin role not found"));

            // Check if the user already has the admin role
            if (user.getRoles().contains(adminRole)) {
                throw new IllegalStateException("User is already an admin.");
            }

            // Optional: Prevent an admin from promoting themselves
            if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
                throw new IllegalStateException("You cannot assign admin role to yourself.");
            }

            // Add the ADMIN role and save the changes
            user.getRoles().add(adminRole);
            userRepository.save(user);

            // Optional: Log this action for audit purposes
     //   logger.info("Admin role added to user {} by {}", user.getEmail(), currentAdminEmail);
        }





    @Transactional
    public void removeAdminRoleFromUser(int userId, String authHeader) {

        String currentAdminEmail= jwtService.getEmailFromToken(authHeader);
        // Load the user from which the admin role will be removed
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Retrieve the ADMIN role from the role repository
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new EntityNotFoundException("Admin role not found"));

        // Check if the user actually has the ADMIN role
        if (!user.getRoles().contains(adminRole)) {
            throw new IllegalStateException("User does not have the admin role");
        }

        // Ensure that removing the admin role doesn't leave the system with no admin
        long adminCount = userRepository.countByRolesContaining(adminRole);
        if (adminCount <= 1) {
            throw new IllegalStateException("Cannot remove admin role; at least one admin must remain");
        }

        // Optional: Prevent an admin from removing their own role
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new IllegalStateException("You cannot remove your own admin role");
        }

        // Remove the admin role and save the updated user entity
        user.getRoles().remove(adminRole);
        userRepository.save(user);

        // Optionally log the action for audit purposes

      //  logger.info("Admin role removed from user {} by {}", user.getEmail(), currentAdminEmail);
    }

    @Override
    public List<UserDto> getAllAdmins() {



            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new EntityNotFoundException("Admin role not found"));

            List<User> admins= userRepository.findByRolesContaining(adminRole);

            System.out.println("\n\n"+admins.toString());

            return admins.stream()
                    .map(admin->  userService.userToDto(admin) )
                    .collect(Collectors.toList());

    }

}
