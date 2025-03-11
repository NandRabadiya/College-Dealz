package com.nd.service.Impl;

import com.nd.entities.ArchivedWantlist;
import com.nd.repositories.ArchivedWantlistRepo;
import com.nd.service.ArchivedWantlistService;
import com.nd.service.AuthenticationService;
import com.nd.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ArchivedWantlistServiceImpl implements ArchivedWantlistService {

    @Autowired
    private ArchivedWantlistRepo archivedWantlistRepository;

   @Autowired
   private JwtService jwtService;

    @Override
    @Transactional
    public ArchivedWantlist archiveWantlist(ArchivedWantlist archivedWantlist, String authToken) {
        Integer userId = jwtService.getUserIdFromToken(authToken);
        archivedWantlist.setUserId(userId);
        archivedWantlist.setRemovedAt(Instant.now());
        return archivedWantlistRepository.save(archivedWantlist);
    }

    @Override
    public List<ArchivedWantlist> getAllArchivedWantlists() {
        return archivedWantlistRepository.findAll();
    }

    @Override
    public Optional<ArchivedWantlist> getArchivedWantlistById(Integer id) {
        return archivedWantlistRepository.findById(id);
    }

    @Override
    @Transactional
    public ArchivedWantlist updateArchivedWantlist(Integer id, ArchivedWantlist updatedArchivedWantlist, String authToken) {
        Integer userId = jwtService.getUserIdFromToken(authToken);
        Optional<ArchivedWantlist> existingWantlist = archivedWantlistRepository.findById(id);

        if (existingWantlist.isPresent() && existingWantlist.get().getUserId().equals(userId)) {
            ArchivedWantlist wantlist = existingWantlist.get();
            wantlist.setProductName(updatedArchivedWantlist.getProductName());
            wantlist.setCategory(updatedArchivedWantlist.getCategory());
            wantlist.setDescription(updatedArchivedWantlist.getDescription());
            wantlist.setPriceMax(updatedArchivedWantlist.getPriceMax());
            wantlist.setMonthsOldMax(updatedArchivedWantlist.getMonthsOldMax());
            wantlist.setWantlistRemovalReason(updatedArchivedWantlist.getWantlistRemovalReason());
            return archivedWantlistRepository.save(wantlist);
        }
        throw new RuntimeException("Unauthorized or archived wantlist not found");
    }

    @Override
    @Transactional
    public void deleteArchivedWantlist(Integer id, String authToken) {
        Integer userId = jwtService.getUserIdFromToken(authToken);
        Optional<ArchivedWantlist> existingWantlist = archivedWantlistRepository.findById(id);

        if (existingWantlist.isPresent() && existingWantlist.get().getUserId().equals(userId)) {
            archivedWantlistRepository.deleteById(id);
        } else {
            throw new RuntimeException("Unauthorized or archived wantlist not found");
        }
    }
}
