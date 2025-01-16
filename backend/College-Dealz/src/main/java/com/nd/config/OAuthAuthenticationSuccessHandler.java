package com.nd.config;

import com.nd.entities.Role;
import com.nd.entities.User;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.RoleRepo;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    @Autowired
    private UniversityRepo universityRepo;

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

                userRepo.save(user);


            }

//        } else if (authorizedClientRegistrationId.equalsIgnoreCase("github")) {
//
//            // github
//            // github attributes
//            String email = oauthUser.getAttribute("email") != null ? oauthUser.getAttribute("email").toString()
//                    : oauthUser.getAttribute("login").toString() + "@gmail.com";
//            String picture = oauthUser.getAttribute("avatar_url").toString();
//            String name = oauthUser.getAttribute("login").toString();
//            String providerUserId = oauthUser.getName();
//
//            user.setEmail(email);
//            user.setProfilePic(picture);
//            user.setName(name);
//            user.setProviderUserId(providerUserId);
//            user.setProvider(Providers.GITHUB);
//
//            user.setAbout("This account is created using github");
//        }
//
//        else if (authorizedClientRegistrationId.equalsIgnoreCase("linkedin")) {
//
//        }
//
//        else {
//            logger.info("OAuthAuthenicationSuccessHandler: Unknown provider");
//        }

            // save the user
            // facebook
            // facebook attributes
            // linkedin

            /*
             *
             *
             *
             * DefaultOAuth2User user = (DefaultOAuth2User) authentication.getPrincipal();
             *
             * logger.info(user.getName());
             *
             * user.getAttributes().forEach((key, value) -> {
             * logger.info("{} => {}", key, value);
             * });
             *
             * logger.info(user.getAuthorities().toString());
             *
             * // data database save:
             *
             * String email = user.getAttribute("email").toString();
             * String name = user.getAttribute("name").toString();
             * String picture = user.getAttribute("picture").toString();
             *
             * // create user and save in database
             *
             * User user1 = new User();
             * user1.setEmail(email);
             * user1.setName(name);
             * user1.setProfilePic(picture);
             * user1.setPassword("password");
             * user1.setUserId(UUID.randomUUID().toString());
             * user1.setProvider(Providers.GOOGLE);
             * user1.setEnabled(true);
             *
             * user1.setEmailVerified(true);
             * user1.setProviderUserId(user.getName());
             * user1.setRoleList(List.of(AppConstants.ROLE_USER));
             * user1.setAbout("This account is created using google..");
             *
             * User user2 = userRepo.findByEmail(email).orElse(null);
             * if (user2 == null) {
             *
             * userRepo.save(user1);
             * logger.info("User saved:" + email);
             * }
             *
             */
//
//        User user2 = userRepo.findByEmail(user.getEmail()).orElse(null);
//        if (user2 == null) {
//            userRepo.save(user);
//            System.out.println("user saved:" + user.getEmail());
//        }
//
//        new DefaultRedirectStrategy().sendRedirect(request, response, "/user/profile");

        }
    }
}