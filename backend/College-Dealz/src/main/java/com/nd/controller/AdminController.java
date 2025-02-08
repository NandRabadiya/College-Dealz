package com.nd.controller;

import com.nd.dto.UserDto;
import com.nd.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin_only")
public class AdminController {

    @Autowired
    private AdminService adminService;


    @PostMapping("/add/{userId}")
    public ResponseEntity<String> addAdmin(@PathVariable int userId,
                                           @RequestHeader("Authorization") String authHeader) {
        adminService.addAdmin(userId, authHeader);
        return ResponseEntity.ok("Admin role added successfully.");
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> getAllAdmins() {
        List<UserDto> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    @DeleteMapping("/remove/{userId}")
    public ResponseEntity<String> removeAdmin(@PathVariable int userId,
                                              @RequestHeader("Authorization") String authHeader) {
        adminService.removeAdminRoleFromUser(userId, authHeader);
        return ResponseEntity.ok("Admin role removed successfully.");
    }
}
