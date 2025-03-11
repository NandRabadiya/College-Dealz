package com.nd.service.Impl;

import com.nd.dto.WantlistDto;
import com.nd.entities.ArchivedWantlist;
import com.nd.entities.User;
import com.nd.entities.Wantlist;
import com.nd.enums.WantlistRemovalReason;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.ArchivedWantlistRepo;
import com.nd.repositories.UserRepo;
import com.nd.repositories.WantlistRepo;
import com.nd.service.NotificationService;
import com.nd.service.WantlistService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WantlistServiceImpl implements WantlistService {

    private final WantlistRepo wantlistRepository;
    private final UserRepo userRepository;
    private final NotificationService notificationService;

    private final ArchivedWantlistRepo archivedWantlistRepository;

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
        wantlist.setCreatedAt(Instant.now());
        wantlist.setUpdatedAt(Instant.now());
        Wantlist savedWantlist = wantlistRepository.save(wantlist);

        // ✅ Trigger notification for all users except the one who added the item
       notificationService.createNotificationForAllUsers(userId, savedWantlist.getId());


        return toDto(savedWantlist);
    }

    @Override
    @Transactional
    public void removeProductFromWantlist(Integer userId, Integer wantlistId, String reason) {
        Wantlist wantlist = wantlistRepository.findById(wantlistId)
                .orElseThrow(() -> new EntityNotFoundException("Wantlist item not found with ID: " + wantlistId));

        // Ensure that only the user who owns the wantlist can delete it
//        if (!wantlist.getUser().getId().equals(userId)) {
//            throw new ResourceNotFoundException("User is not authorized to remove this product");
//                    //new UnauthorizedAccessException("User is not authorized to remove this wantlist item.");
//        }

        // Create ArchivedWantlist object
        ArchivedWantlist archivedWantlist = new ArchivedWantlist();
        archivedWantlist.setUserId(wantlist.getUser().getId());
        archivedWantlist.setProductName(wantlist.getProductName());
        archivedWantlist.setCategory(wantlist.getCategory());
        archivedWantlist.setDescription(wantlist.getDescription());
        archivedWantlist.setPriceMax(wantlist.getPriceMax());
        archivedWantlist.setMonthsOldMax(wantlist.getMonthsOldMax());
        archivedWantlist.setRemovedAt(Instant.now());

        // Calculate how long the wantlist was active
        if (wantlist.getCreatedAt() != null) {
            long activeDuration = Instant.now().getEpochSecond() - wantlist.getCreatedAt().getEpochSecond();
            archivedWantlist.setActiveDurationDays(activeDuration / (24 * 60 * 60)); // Convert seconds to days
        } else {
            archivedWantlist.setActiveDurationDays(0L); // Default to 0 if createdAt is missing
        }

        // Set the reason for removal
        archivedWantlist.setWantlistRemovalReason(WantlistRemovalReason.valueOf(
                reason.toUpperCase()

        ));

        // Save to archived wantlist
        archivedWantlistRepository.save(archivedWantlist);

        // Delete from active wantlist
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
        dto.setUpdatedAt(wantlist.getUpdatedAt());
        return dto;
    }
}
