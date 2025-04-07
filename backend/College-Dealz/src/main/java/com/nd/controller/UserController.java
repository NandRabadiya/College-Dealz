package com.nd.controller;
import java.util.List;


import com.nd.dto.ApiResponse;
import com.nd.dto.DashboardDTO;
import com.nd.dto.UserDto;
import com.nd.entities.User;
import com.nd.service.JwtService;
import com.nd.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    // POST-create user
    @PostMapping("/")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        UserDto createUserDto = this.userService.registerNewUser(userDto);
        return new ResponseEntity<>(createUserDto, HttpStatus.CREATED);
    }

    //ADMIN
    // DELETE -delete user
   // @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable("userId") Integer uid) {
        this.userService.deleteUser(uid);
        return new ResponseEntity<>(new ApiResponse("User deleted Successfully", true), HttpStatus.OK);
    }

    // GET - user get
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        List<UserDto> users = userService.getAllUsers(authHeader);
        return ResponseEntity.ok(users);
    }

    // GET - user get
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getSingleUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(this.userService.getUserById(userId));
    }


    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(@RequestHeader("Authorization") String token) {
        Integer userId = jwtService.getUserIdFromToken(token); // Get userId from token
        return ResponseEntity.ok(userService.getDashboard(userId));
    }

    // 🔹 PUT /dashboard/{id} → Update user profile
    @PutMapping("/update")
    public ResponseEntity<DashboardDTO> updateDashboard(

            @RequestBody DashboardDTO dashboardDTO,
            @RequestHeader("Authorization") String token) {

        int userId =jwtService.getUserIdFromToken(token);

//        if (userId != id) {
//            return ResponseEntity.status(403).body(null); // Forbidden: User can only update their own profile
//        }

        DashboardDTO updatedProfile = userService.updateDashboard(userId, dashboardDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/guided")
    public ResponseEntity<?> updateGuidedDashboard(@RequestHeader("Authorization") String token, @RequestParam boolean guided) {

        int userId = jwtService.getUserIdFromToken(token);
        userService.updateGuided(userId,guided);
        return ResponseEntity.ok().build();
    }

}
