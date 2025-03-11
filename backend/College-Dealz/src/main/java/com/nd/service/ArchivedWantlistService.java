package com.nd.service;

import com.nd.entities.ArchivedWantlist;
import java.util.List;
import java.util.Optional;

public interface ArchivedWantlistService {
    ArchivedWantlist archiveWantlist(ArchivedWantlist archivedWantlist, String authToken);
    List<ArchivedWantlist> getAllArchivedWantlists();
    Optional<ArchivedWantlist> getArchivedWantlistById(Integer id);
    ArchivedWantlist updateArchivedWantlist(Integer id, ArchivedWantlist updatedArchivedWantlist, String authToken);
    void deleteArchivedWantlist(Integer id, String authToken);
}
