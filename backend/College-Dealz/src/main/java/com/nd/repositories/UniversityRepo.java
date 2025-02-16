package com.nd.repositories;

import com.nd.entities.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UniversityRepo extends JpaRepository<University,Integer> {

    Optional<University> findByName(String name);

    boolean existsByDomain(String domain);
    University findUniversitiesByDomain(String domain );

    University getUniversitiesById(University university);

    @Override
    Optional<University> findById(Integer integer);

    Optional<University> getUniversitiesByDomain(String domain);


}
