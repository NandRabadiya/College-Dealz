package com.nd.repositories;

import com.nd.dto.UserDto;
import com.nd.entities.Role;
import com.nd.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepo extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("select u from User u where u.email = :email")
    User findUByEmail(@Param("email") String email);

    @Query("SELECT u.id FROM User u WHERE u.university.id = :universityId")
List<Integer> findUserIdsByUniversityId(@Param("universityId") Integer universityId);

int countByRolesContaining(Role role);

    @Override
    Optional<User> findById(Integer integer);

   // int getUserByEmail(String email);

    @Query("SELECT u.id FROM User u WHERE u.email = :email")
    Optional<Integer> getUserIdByEmail(@Param("email") String email);


   List<User> findByRolesContaining(Role role);
}

