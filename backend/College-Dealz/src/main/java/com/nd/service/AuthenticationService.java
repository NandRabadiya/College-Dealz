package com.nd.service;

import com.nd.dto.AuthResponse;
import com.nd.entities.Role;
import com.nd.entities.Token;
import com.nd.entities.University;
import com.nd.entities.User;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.RoleRepo;
import com.nd.repositories.TokenRepository;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nimbusds.openid.connect.sdk.AuthenticationResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;


@Service
public class AuthenticationService {

    private final RoleRepo roleRepository;
    private final UserRepo repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final UniversityRepo universityRepo;

    public AuthenticationService(RoleRepo roleRepository, UserRepo repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 TokenRepository tokenRepository,
                                 AuthenticationManager authenticationManager, UniversityRepo universityRepo) {
        this.roleRepository = roleRepository;
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.authenticationManager = authenticationManager;
        this.universityRepo = universityRepo;
    }

    public AuthResponse register(User request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse(null, null, "User already exists");
        }

        System.out.println("\n\n Authentication Service register method  \n\n");

        User user = new User();
        user.setName(request.getName());

        String domain = request.getEmail().substring(request.getEmail().indexOf("@") + 1);

        University university = universityRepo.getUniversitiesByDomain(domain)
                .orElseThrow(() -> new ResourceNotFoundException("University not found for domain: " + domain));




        user.setUniversity(university);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role defaultRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        user.setRoles(new HashSet<>(Collections.singletonList(defaultRole)));

        user = repository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        saveUserToken(accessToken, refreshToken, user);

        return new AuthResponse(accessToken, refreshToken, "User registration was successful");
    }

    public AuthResponse authenticate(User request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = repository.findByEmail(request.getEmail()).orElseThrow();
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllTokenByUser(user);
        saveUserToken(accessToken, refreshToken, user);

        return new AuthResponse(accessToken, refreshToken, "User login was successful");
    }

    private void revokeAllTokenByUser(User user) {
        List<Token> validTokens = tokenRepository.findAllAccessTokensByUser(user.getId());
        if (validTokens.isEmpty()) {
            return;
        }

        validTokens.forEach(t -> t.setLoggedOut(true));
        tokenRepository.saveAll(validTokens);
    }

    private void saveUserToken(String accessToken, String refreshToken, User user) {
        Token token = new Token();
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setLoggedOut(false);
        token.setUser(user);
        tokenRepository.save(token);
    }

    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found"));

        if (jwtService.isValidRefreshToken(token, user)) {
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            revokeAllTokenByUser(user);
            saveUserToken(accessToken, refreshToken, user);

            return new ResponseEntity<>(
                    new AuthResponse(accessToken, refreshToken, "New token generated"),
                    HttpStatus.OK
            );
        }

        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
