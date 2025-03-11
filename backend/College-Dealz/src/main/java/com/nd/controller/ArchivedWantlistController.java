package com.nd.controller;

import com.nd.entities.ArchivedWantlist;
import com.nd.service.ArchivedWantlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/archived-wantlist")
public class ArchivedWantlistController {

    @Autowired
    private ArchivedWantlistService archivedWantlistService;

    @PostMapping
    public ResponseEntity<ArchivedWantlist> archiveWantlist(@RequestBody ArchivedWantlist archivedWantlist,
                                                            @RequestHeader("Authorization") String authToken) {
        ArchivedWantlist savedWantlist = archivedWantlistService.archiveWantlist(archivedWantlist, authToken);
        return ResponseEntity.ok(savedWantlist);
    }

    @GetMapping
    public ResponseEntity<List<ArchivedWantlist>> getAllArchivedWantlists() {
        return ResponseEntity.ok(archivedWantlistService.getAllArchivedWantlists());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArchivedWantlist> getArchivedWantlistById(@PathVariable Integer id) {
        Optional<ArchivedWantlist> archivedWantlist = archivedWantlistService.getArchivedWantlistById(id);
        return archivedWantlist.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArchivedWantlist> updateArchivedWantlist(@PathVariable Integer id,
                                                                   @RequestBody ArchivedWantlist updatedArchivedWantlist,
                                                                   @RequestHeader("Authorization") String authToken) {
        ArchivedWantlist updated = archivedWantlistService.updateArchivedWantlist(id, updatedArchivedWantlist, authToken);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArchivedWantlist(@PathVariable Integer id,
                                                       @RequestHeader("Authorization") String authToken) {
        archivedWantlistService.deleteArchivedWantlist(id, authToken);
        return ResponseEntity.noContent().build();
    }
}