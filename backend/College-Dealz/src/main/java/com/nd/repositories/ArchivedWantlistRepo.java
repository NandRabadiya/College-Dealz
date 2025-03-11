package com.nd.repositories;

import com.nd.entities.ArchivedWantlist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchivedWantlistRepo extends JpaRepository<ArchivedWantlist, Integer> {
}
