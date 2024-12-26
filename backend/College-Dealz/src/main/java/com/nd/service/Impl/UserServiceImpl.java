package com.nd.service.Impl;


import java.util.List;
import java.util.stream.Collectors;

import com.nd.config.AppConstants;
import com.nd.dto.UserDto;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.RoleRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nd.entities.*;

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

    @Override
    public UserDto createUser(UserDto userDto) {
        User user = this.dtoToUser(userDto);
        User savedUser = this.userRepo.save(user);
        return this.userToDto(savedUser);
    }

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
    public List<UserDto> getAllUsers() {

        List<User> users = this.userRepo.findAll();
        List<UserDto> userDtos = users.stream().map(user -> this.userToDto(user)).collect(Collectors.toList());

        return userDtos;
    }

    @Override
    public void deleteUser(Integer userId) {
        User user = this.userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "Id", userId));
        this.userRepo.delete(user);

    }

    public User dtoToUser(UserDto userDto) {
       // User user = this.modelMapper.map(userDto, User.class);

        User user=new User();
         user.setId(userDto.getId());
         user.setName(userDto.getName());
         user.setEmail(userDto.getEmail());

         user.setPassword(userDto.getPassword());
        return user;
    }

    public UserDto userToDto(User user) {
       // UserDto userDto = this.modelMapper.map(user, UserDto.class);
        UserDto userDto=new UserDto();

        user.setId(userDto.getId());
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());

        user.setPassword(userDto.getPassword());

        return userDto;
    }

//    @Override
//    public UserDto registerNewUser(UserDto userDto) {
//
//        User user = this.modelMapper.map(userDto, User.class);
//
//        // encoded the password
//        user.setPassword(this.passwordEncoder.encode(user.getPassword()));
//
//        // roles
//        Role role = this.roleRepo.findById(AppConstants.NORMAL_USER).get();
//
//        user.getRoles().add(role);
//
//        User newUser = this.userRepo.save(user);
//
//        return this.modelMapper.map(newUser, UserDto.class);
//    }

}