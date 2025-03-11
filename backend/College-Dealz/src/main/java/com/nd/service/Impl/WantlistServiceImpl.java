package com.nd.service.Impl;

import com.nd.dto.WantlistDto;
import com.nd.entities.User;
import com.nd.entities.Wantlist;
import com.nd.repositories.UserRepo;
import com.nd.repositories.WantlistRepo;
import com.nd.service.NotificationService;
import com.nd.service.WantlistService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WantlistServiceImpl implements WantlistService {

    private final WantlistRepo wantlistRepository;
    private final UserRepo userRepository;
    private final NotificationService notificationService;

    @Override
    public WantlistDto addProductToWantlist(Integer userId, WantlistDto wantlistDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Wantlist wantlist = new Wantlist();
        wantlist.setUser(user);
        wantlist.setProductName(wantlistDto.getProductName());
        wantlist.setCategory(wantlistDto.getCategory());
        wantlist.setDescription(wantlistDto.getDescription());
        wantlist.setPriceMin(wantlistDto.getPriceMin());
        wantlist.setPriceMax(wantlistDto.getPriceMax());
        wantlist.setMonthsOldMax(wantlistDto.getMonthsOldMax());

        Wantlist savedWantlist = wantlistRepository.save(wantlist);

        // ✅ Trigger notification for all users except the one who added the item
       notificationService.createNotificationForAllUsers(userId, savedWantlist.getId());


        return toDto(savedWantlist);
    }

    @Override
    public void removeProductFromWantlist(Integer userId, Integer wantlistId) {
        if (!wantlistRepository.existsById(wantlistId)) {
            throw new EntityNotFoundException("Wantlist item not found with ID: " + wantlistId);
        }
        wantlistRepository.deleteById(wantlistId);
    }

    @Override
    public List<WantlistDto> getAllWantlist(){
        List<Wantlist> wantlists = wantlistRepository.findAll();
        return wantlists
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WantlistDto> getAllWantlistItemsByUserId(Integer userId) {
        List<Wantlist> wantlist = wantlistRepository.findByUserId(userId);
        return wantlist.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public WantlistDto getWantlistById(Integer wantlistId) {

        Wantlist wantlist=wantlistRepository.getById(wantlistId);

        return toDto(wantlist);
    }
    /**
     * Convert a Wantlist entity to its corresponding DTO.
     */
    private WantlistDto toDto(Wantlist wantlist) {
        WantlistDto dto = new WantlistDto();
        dto.setId(wantlist.getId());
        dto.setUserId(wantlist.getUser().getId());
        dto.setProductName(wantlist.getProductName());
        dto.setCategory(wantlist.getCategory());
        dto.setDescription(wantlist.getDescription());
        dto.setPriceMin(wantlist.getPriceMin());
        dto.setPriceMax(wantlist.getPriceMax());
        dto.setMonthsOldMax(wantlist.getMonthsOldMax());
        return dto;
    }
}
