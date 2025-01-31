package com.nd.service.Impl;

import com.nd.dto.UniversityDto;
import com.nd.entities.University;
import com.nd.repositories.UniversityRepo;
import com.nd.service.UniversityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UniversityServiceImpl implements UniversityService {

    @Autowired
    private UniversityRepo universityRepository;

    // Helper method to map Entity to DTO
    private UniversityDto mapToDto(University university) {
        UniversityDto dto = new UniversityDto();
        dto.setId(university.getId());
        dto.setName(university.getName());
        dto.setDomain(university.getDomain());
        dto.setLocation(university.getLocation());
        return dto;
    }

    // Helper method to map DTO to Entity
    private University mapToEntity(UniversityDto dto) {
        University university = new University();
        university.setId(dto.getId());
        university.setName(dto.getName());
        university.setDomain(dto.getDomain());
        university.setLocation(dto.getLocation());
        return university;
    }

    @Override
    public List<UniversityDto> getAllUniversities() {
        List<University> universities = universityRepository.findAll();
        System.out.println("Universities fetched: " + universities);
        return universities.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public UniversityDto getUniversityById(int id) {
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("University not found with id: " + id));
        return mapToDto(university);
    }

    @Override
    public UniversityDto createUniversity(UniversityDto universityDto) {
        University university = mapToEntity(universityDto);
        University savedUniversity = universityRepository.save(university);
        return mapToDto(savedUniversity);
    }

    @Override
    public UniversityDto updateUniversity(int id, UniversityDto universityDto) {
        University existingUniversity = universityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("University not found with id: " + id));

        // Update fields
        existingUniversity.setName(universityDto.getName());
        existingUniversity.setDomain(universityDto.getDomain());
        existingUniversity.setLocation(universityDto.getLocation());

        University updatedUniversity = universityRepository.save(existingUniversity);
        return mapToDto(updatedUniversity);
    }

    @Override
    public void deleteUniversity(int id) {
        University existingUniversity = universityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("University not found with id: " + id));
        universityRepository.delete(existingUniversity);
    }
}
