package com.nd.repositories;

import com.nd.dto.UserDto;
import com.nd.entities.Role;
import com.nd.entities.University;
import com.nd.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepo extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

int countByRolesContaining(Role role);


    @EntityGraph(attributePaths = "roles")
    Optional<User> findWithRolesByEmail(String email);

    @Query("SELECT u.id FROM User u WHERE u.email = :email")
    Optional<Integer> getUserIdByEmail(@Param("email") String email);
@EntityGraph(attributePaths = "roles")
    List<User> findByRolesContaining(Role role);

    List<User> findAllByUniversity(University university);
}

