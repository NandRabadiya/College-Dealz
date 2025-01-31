package com.nd.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nd.dto.AuthResponse;
import com.nd.entities.Role;
import com.nd.entities.Token;
import com.nd.entities.User;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.RoleRepo;
import com.nd.repositories.TokenRepository;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.JwtService;
import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import static com.nd.enums.Provider.GOOGLE;

@Component
public class OAuthAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    Logger logger = LoggerFactory.getLogger(OAuthAuthenticationSuccessHandler.class);

    @Autowired
    private UserRepo userRepo;


    @Autowired
    private RoleRepo roleRepo;

    private final TokenRepository tokenRepository;
    @Autowired
    private final JwtService jwtService;

    @Autowired
    private UniversityRepo universityRepo;

    public OAuthAuthenticationSuccessHandler(TokenRepository tokenRepository, JwtService jwtService) {
        this.tokenRepository = tokenRepository;
        this.jwtService = jwtService;
    }


    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        logger.info("OAuthAuthenicationSuccessHandler");

        // identify the provider

        var oauth2AuthenicationToken = (OAuth2AuthenticationToken) authentication;

        String authorizedClientRegistrationId = oauth2AuthenicationToken.getAuthorizedClientRegistrationId();

        logger.info(authorizedClientRegistrationId);


        logger.info("Provider: {}", authorizedClientRegistrationId);

        var oauthUser = (DefaultOAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        logger.info("User Email: {}", email);


        // Extract domain from email
        String domain = email.substring(email.indexOf("@") + 1);
        logger.info("Extracted Domain: {}", domain);

        // Check if domain exists in University table
        boolean isValidDomain = universityRepo.existsByDomain(domain);

        if (!isValidDomain) {
            throw new RuntimeException("Try using your college email ID.");
        }

        logger.info(" Succefull login User Email: {}", email);

        oauthUser.getAttributes().forEach((key, value) -> {
            logger.info(key + " : " + value);
        });

        if (!userRepo.existsByEmail(oauthUser.getAttribute("email").toString())) {
            User user = new User();
            user.setEmailVerified(true);
            user.setEnabled(true);
           user.setUniversity(universityRepo.findUniversitiesByDomain(domain));

        if (authorizedClientRegistrationId.equalsIgnoreCase("google")) {

            logger.info("OAuthAuthenicationSuccessHandler: Google New user" );

            // google
            // google attributes

                user.setEmail(oauthUser.getAttribute("email").toString());
                //  user.setProfilePicture(oauthUser.getAttribute("picture").toString());
                user.setName(oauthUser.getAttribute("name").toString());
                user.setProviderUserId(oauthUser.getName());
                user.setProvider(GOOGLE);
                Role userRole = this.roleRepo.findById(1).orElseThrow(() ->
                        new ResourceNotFoundException("Role", "ID", 1));

                user.getRoles().add(userRole);


logger.info("OAuthAuthenicationSuccessHandler: Google New user check before user save" );

    User user1=userRepo.save(user);

            user1 = userRepo.findById(user1.getId()).orElseThrow();

            logger.info("OAuth check after user save" );
            String accessToken = jwtService.generateAccessToken(user1);
            String refreshToken = jwtService.generateRefreshToken(user1);


           jwtService. saveUserToken(accessToken, refreshToken, user1);

            AuthResponse authResponse = new AuthResponse(accessToken, refreshToken, "User login was successful");

            // Convert the AuthResponse object to JSON
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonResponse = objectMapper.writeValueAsString(authResponse);

            // Write the JSON response
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(jsonResponse);

        }

       }
    }




}