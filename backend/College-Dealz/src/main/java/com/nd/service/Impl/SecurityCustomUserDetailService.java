package com.nd.service.Impl;

import com.nd.entities.User;
import com.nd.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;



@Service
public class SecurityCustomUserDetailService implements UserDetailsService {

    @Autowired
    private final UserRepo userRepository;

    public SecurityCustomUserDetailService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        System.out.println("Looking for user: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword()) // Make sure this is BCrypt hashed
                //.roles(user.getRole()) // Assuming `role` is available in your `User` entity
                .build();
    }

}