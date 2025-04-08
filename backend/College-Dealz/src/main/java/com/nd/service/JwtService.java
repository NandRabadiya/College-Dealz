package com.nd.service;

import com.nd.entities.Token;
import com.nd.entities.User;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.TokenRepository;
import com.nd.repositories.UserRepo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("25356b706b45fbd59190233d355e138a866d25f66c3a1864511cf8245bbfc113")
    private String secretKey;

    @Value(value = "${application.security.jwt.access-token-expiration}")
    private long accessTokenExpire;

    @Value("${application.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpire;

    @Autowired
    private UserRepo   userRepo;


    @Autowired
    private EntityManager entityManager;

    private final TokenRepository tokenRepository;

    public JwtService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }



    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    public boolean isValid(String token, UserDetails user) {
        String username = extractUsername(token);

        boolean validToken = tokenRepository
                .findByAccessToken(token)
                .map(t -> !t.isLoggedOut())
                .orElse(false);

        return (username.equals(user.getUsername())) && !isTokenExpired(token) && validToken;
    }

    public boolean isValidRefreshToken(String token, User user) {
        String username = extractUsername(token);

        boolean validRefreshToken = tokenRepository
                .findByRefreshToken(token)
                .map(t -> !t.isLoggedOut())
                .orElse(false);

        return (username.equals(user.getUsername())) && !isTokenExpired(token) && validRefreshToken;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Set the key used for verification
                .build()
                .parseClaimsJws(token)         // Parse the signed token
                .getBody();                    // Extract the Claims payload
    }



    public String generateAccessToken(User user) {
        return generateToken(user, accessTokenExpire);
    }

    public String generateRefreshToken(User user) {


        return generateToken(user, refreshTokenExpire );
    }

    private String generateToken(User user, long expireTime) {

        System.out.println("\n\n In generate token method of the jwt service \n\n ");


            return Jwts.builder()
                    .setSubject(user.getUsername())// Set the subject (username)
                    .claim("email", user.getEmail())
                    .setIssuedAt(new Date(System.currentTimeMillis())) // Issue time
                    .setExpiration(new Date(System.currentTimeMillis() + expireTime)) // Expiration time
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Signing key and algorithm
                    .compact(); // Generate the compact JWT
    }


    private SecretKey getSigningKey() {
        if (secretKey == null || secretKey.isEmpty()) {
            throw new IllegalArgumentException("JWT Secret Key is missing or empty.");
        }
        System.out.println("JWT Secret Key: " + secretKey);
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    public String getEmailFromToken(String token) {
        if (token == null || token.isEmpty()) {
            // Log invalid token and return null or handle the error gracefully
            System.out.println("Invalid token: token is null or empty");
            return null;
        }
        try {
            // Remove "Bearer " prefix if present
            token = token.startsWith("Bearer ") ? token.substring(7) : token;

            // Parse the token to extract claims
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            System.out.println("Token Claims: " + claims);

            // Try to retrieve email from the claims
            String email = claims.get("email", String.class);

            if (email == null || email.isEmpty()) {
                // Fallback to "sub" claim if email is null or empty
                String subject = claims.getSubject();
                if (isValidEmail(subject)) {
                    return subject;
                } else {
                    throw new ResourceNotFoundException("Subject is not a valid email address.");
                }
            }

            // Return email if found
            return email;

        } catch (JwtException e) {
            // Log or handle the exception (invalid or expired token)
            throw new RuntimeException("Invalid JWT Token", e);
        }
    }

    private boolean isValidEmail(String email) {
        // Simple regex to validate email format
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

    public int getUserIdFromToken(String token) {
        String email = getEmailFromToken(token);

        // Attempt to fetch the user ID by email
        Optional<Integer> userIdOptional = userRepo.getUserIdByEmail(email);

        // If user is not found, throw a ResourceNotFoundException with a clear message
        return userIdOptional.orElseThrow(() ->
                new ResourceNotFoundException("User with email '" + email + "' not found"));
    }

    public int getUniversityIdFromToken(String token) {
        String email = getEmailFromToken(token);

        // Fetch the user by email and handle cases where the user is not found
        User user = userRepo.findWithRolesByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        ;


        // Check if the user has a university associated and handle the null case
        if (user.getUniversity() == null) {
            throw new ResourceNotFoundException(
                    "University information is not available for user with email '" + email + "'");
        }

        // Return the university ID if everything is valid
        return user.getUniversity().getId();
    }

    @Transactional
    public void saveUserToken(String accessToken, String refreshToken, User user) {
        Token token = new Token();
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setLoggedOut(false);

      //  logger.info("OAuth check in token table before save");

       // Ensure user is merged (attached to the current session)
        User managedUser = entityManager.merge(user); // This will be done inside a transaction
        token.setUser(user);

        tokenRepository.save(token);

      //  logger.info("OAuth check after token save");
    }

}