package com.nd.controller;

import com.nd.dto.UniversityDto;
import com.nd.service.UniversityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {

    @Autowired
    private UniversityService universityService;

    // GET: Retrieve all universities
    @GetMapping
    public ResponseEntity<List<UniversityDto>> getAllUniversities() {
        return ResponseEntity.ok(universityService.getAllUniversities());
    }

    // GET: Retrieve a university by ID
    @GetMapping("/{id}")
    public ResponseEntity<UniversityDto> getUniversityById(@PathVariable int id) {
        return ResponseEntity.ok(universityService.getUniversityById(id));
    }

    // POST: Create a new university
    @PostMapping
    public ResponseEntity<UniversityDto> createUniversity(@RequestBody UniversityDto universityDto) {
        return ResponseEntity.ok(universityService.createUniversity(universityDto));
    }

    // PUT: Update an existing university
    @PutMapping("/{id}")
    public ResponseEntity<UniversityDto> updateUniversity(@PathVariable int id, @RequestBody UniversityDto universityDto) {
        return ResponseEntity.ok(universityService.updateUniversity(id, universityDto));
    }

    // DELETE: Delete a university by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUniversity(@PathVariable int id) {
        universityService.deleteUniversity(id);
        return ResponseEntity.noContent().build();
    }
}
