package com.nd.service;

import com.nd.dto.UniversityDto;

import java.util.List;

public interface UniversityService {
    List<UniversityDto> getAllUniversities();
    UniversityDto getUniversityById(int id);
    UniversityDto createUniversity(UniversityDto universityDto);
    UniversityDto updateUniversity(int id, UniversityDto universityDto);
    void deleteUniversity(int id);
}
