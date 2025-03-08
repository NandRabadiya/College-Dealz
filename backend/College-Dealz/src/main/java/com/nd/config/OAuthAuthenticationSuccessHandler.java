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
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.SecureRandom;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import static com.nd.enums.Provider.GOOGLE;

@Component
public class OAuthAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    Logger logger = LoggerFactory.getLogger(OAuthAuthenticationSuccessHandler.class);

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private final JwtService jwtService;

    @Autowired
    private UniversityRepo universityRepo;

    public OAuthAuthenticationSuccessHandler(TokenRepository tokenRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.passwordEncoder = passwordEncoder;

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

//        if (!isValidDomain) {
//            throw new RuntimeException("Try using your college email ID.");
//        }

        if (!isValidDomain) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Try using your college email ID.");
            return;
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
                user.setPassword(passwordEncoder.encode(generateRandomPassword()));

                String imageUrl=oauthUser.getAttribute("picture").toString();
            try {
                byte[] imageBytes = downloadImage(imageUrl);
                user.setProfilePicture(imageBytes);  // Assuming 'profilePicture' is a byte[] field
            } catch (IOException e) {
                // Log the error; you may choose to continue without the image
                System.err.println("Error downloading profile image: " + e.getMessage());
            }

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

//            request.getSession().setAttribute("JWT_ACCESS_TOKEN", accessToken);
//            request.getSession().setAttribute("JWT_REFRESH_TOKEN", refreshToken);


            // Write the JSON response
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(jsonResponse);
          //   final String frontendRedirectUrl = "http://localhost:5173/oauth-callback";
          final String frontendRedirectUrl = "https://college-dealz.vercel.app/oauth-callback";
            response.sendRedirect(frontendRedirectUrl + "?token=" + accessToken);
        }

       }



    }

    public static String generateRandomPassword() {
        int length = 7;
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(CHARACTERS.length());
            password.append(CHARACTERS.charAt(index));
        }
        return password.toString();
    }

    public static byte[] downloadImage(String imageUrl) throws IOException {
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        // Optional: set timeouts and request method
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);

        // Check for a successful response
        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new IOException("Failed to fetch image. HTTP response code: " + responseCode);
        }

        // Optionally, you can check the content type to ensure it's an image
        String contentType = connection.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("The URL does not point to an image: " + contentType);
        }

        // Read the image data into a byte array
        try (InputStream in = connection.getInputStream()) {
            // Java 9+ provides readAllBytes(), for earlier versions you might use Apache Commons IO
            return in.readAllBytes();
        }
    }


}