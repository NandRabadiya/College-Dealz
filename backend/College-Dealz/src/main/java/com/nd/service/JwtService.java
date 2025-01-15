package com.nd.service;

import com.nd.entities.User;
import com.nd.repositories.TokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("25356b706b45fbd59190233d355e138a866d25f66c3a1864511cf8245bbfc113")
    private String secretKey;

    @Value(value = "${application.security.jwt.access-token-expiration}")
    private long accessTokenExpire;

    @Value("${application.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpire;


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


    public  String getEmailFromToken(String token) {

        if (token == null || token.isEmpty()) {
            // Log invalid token and return null or handle the error gracefully
            System.out.println("Invalid token: token is null or empty");
            return null;
        }
        try {
            token=token.substring(7);
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("email", String.class);
        } catch (JwtException e) {
            // Log or handle the exception (invalid or expired token)
            throw new RuntimeException("Invalid JWT Token", e);
        }
    }

}