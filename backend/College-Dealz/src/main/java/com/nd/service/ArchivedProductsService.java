package com.nd.service;

import com.nd.entities.ArchivedProducts;

import java.util.List;

public interface ArchivedProductsService {

    List<ArchivedProducts> getAllArchivedProducts();
    ArchivedProducts getArchivedProductById(int id);
    ArchivedProducts createArchivedProduct(ArchivedProducts archivedProduct);
    ArchivedProducts updateArchivedProduct(int id, ArchivedProducts archivedProduct);
    void deleteArchivedProduct(int id);
}
