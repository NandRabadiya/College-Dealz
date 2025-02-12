package com.nd.service.Impl;


import com.nd.dto.UserDto;
import com.nd.entities.Role;
import com.nd.entities.University;
import com.nd.entities.User;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.RoleRepo;
import com.nd.repositories.TokenRepository;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.JwtService;
import com.nd.service.UserService;
import jakarta.validation.constraints.Null;
import lombok.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Data
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private UniversityRepo universityRepo;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    JwtService jwtService;



    public UserServiceImpl() {
    }

//    @Override
//    public UserDto createUser(UserDto userDto) {
//        User user = this.dtoToUser(userDto);
//        User savedUser = this.userRepo.save(user);
//        return this.userToDto(savedUser);
//    }

    @Override
    public UserDto updateUser(UserDto userDto, Integer userId) {

        User user = this.userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", " Id ", userId));

        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());


        User updatedUser = this.userRepo.save(user);
        UserDto userDto1 = this.userToDto(updatedUser);
        return userDto1;
    }

    @Override
    public UserDto getUserById(Integer userId) {

        User user = this.userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", " Id ", userId));

        return this.userToDto(user);
    }

    @Override
    public List<UserDto> getAllUsers(String authHeader) {
        System.out.println("\n \n getAllUsers \n \n");
        int u = jwtService.getUserIdFromToken(authHeader);
        if(u!=0){
//        List<User> users = this.userRepo.findAll();
//        users.forEach(user -> System.out.println(user.toString())); // Ensure all fields are populated
//
//        List<UserDto> userDtos = users.stream().map(user -> this.userToDto(user)).collect(Collectors.toList());
//
//        return userDtos;

            return userRepo.findAll().stream().map(this::userToDto).collect(Collectors.toList());
        }
        return null;
    }

    @Override
    public void deleteUser(Integer userId) {
        User user = this.userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "Id", userId));
        this.userRepo.delete(user);

    }


    @Override
    public User findUserByJwt(String jwt) {
        String email = jwtService.getEmailFromToken(jwt);
        return findUserByEmail(email);
    }

    private User findUserByEmail(String email) {
        User user = userRepo.findUByEmail(email);

       if(user!= null) {
           return user;
       }
        System.out.println("User not found");
       throw new RuntimeException("User not found");
    }


    public User dtoToUser(UserDto userDto) {
        //  User user = this.modelMapper.map(userDto, User.class);

        User user = new User();
        user.setId(userDto.getId());
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        //  user.setRoles(userDto.getRoles());

        return user;
    }

    public UserDto userToDto(User user) {
        // UserDto userDto = this.modelMapper.map(user, UserDto.class);

        UserDto userDtoResponse = new UserDto();
        userDtoResponse.setUniversityName(user.getUniversity().getName());
        userDtoResponse.setId(user.getId());
        userDtoResponse.setName(user.getName());
        userDtoResponse.setEmail(user.getEmail());
       // userDtoResponse.setPassword(user.getPassword()); // Optional, based on whether exposing the password is required
        // userDtoResponse.setRoles(user.getRoles());


        System.out.println("UserTODTO\n");
        System.out.println(userDtoResponse.toString()); // Verify DTO fields

        return userDtoResponse;

    }

    @Override
    public UserDto registerNewUser(UserDto userDto) {

        userDto.toString();

        User user = new User();
       // user.setId(userDto.getId());
        user.setName(userDto.getName());

        Optional<University> university = universityRepo.findByName(userDto.getUniversityName());
        University foundUniversity = university.orElseThrow(() ->
                new ResourceNotFoundException(userDto.getUniversityName(), "Not found university with given name", 200));

        user.setUniversity(foundUniversity);


        // Get the email from userDto and the domain from the university object
        String userEmail = userDto.getEmail();


// Check if the email already exists in the database
        if (userRepo.existsByEmail(userEmail)) {  // Assuming you have a method in userRepo to check existence
            throw new ResourceNotFoundException("User already exists, try logging in.","",200);
        }

// If email doesn't exist, proceed to set the email
        user.setEmail(userEmail);


        String universityDomain = foundUniversity.getDomain(); // Assuming the university object has a getDomain() method

// Extract domain from email
        String emailDomain = userEmail.substring(userEmail.indexOf("@") + 1);

// Compare the domains
        if (!emailDomain.equals(universityDomain)) {
            throw new ResourceNotFoundException("Please login with your university email: ", universityDomain, 200);
        }

// If the domains match, set the user's email
        user.setEmail(userEmail);

        // Validate the password from userDto
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password cannot be null or blank");
        }

        // Set and encode the password

        user.setPassword(this.passwordEncoder.encode(userDto.getPassword()));

        // roles
        //  Role role = this.roleRepo.findById(AppConstants.NORMAL_USER).get();
        Role userRole = this.roleRepo.findById(1).orElseThrow(() ->
                new ResourceNotFoundException("Role", "ID", 1));

        user.getRoles().add(userRole);

        user.toString();

        User newUser = this.userRepo.save(user);


        newUser.toString();

//        return this.modelMapper.map(newUser, UserDto.class);

        UserDto userDtoResponse = new UserDto();
        userDtoResponse.setId(newUser.getId());
        userDtoResponse.setName(newUser.getName());
        userDtoResponse.setEmail(newUser.getEmail());
        userDtoResponse.setPassword(newUser.getPassword()); // Optional, based on whether exposing the password is required
        return userDtoResponse;






    }


    protected boolean canEqual(final Object other) {
        return other instanceof UserServiceImpl;
    }

}