package com.nd.service.Impl;

import com.nd.entities.ArchivedProducts;
import com.nd.repositories.ArchivedProductsRepo;
import com.nd.service.ArchivedProductsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArchivedProductsServiceImpl implements ArchivedProductsService {

    private final ArchivedProductsRepo archivedProductsRepository;

    public ArchivedProductsServiceImpl(ArchivedProductsRepo archivedProductsRepository) {
        this.archivedProductsRepository = archivedProductsRepository;
    }

    @Override
    public List<ArchivedProducts> getAllArchivedProducts() {
        return archivedProductsRepository.findAll();
    }

    @Override
    public ArchivedProducts getArchivedProductById(int id) {
        return archivedProductsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public ArchivedProducts createArchivedProduct(ArchivedProducts archivedProduct) {
        return archivedProductsRepository.save(archivedProduct);
    }

    @Override
    public ArchivedProducts updateArchivedProduct(int id, ArchivedProducts archivedProduct) {
        ArchivedProducts existingProduct = archivedProductsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Update fields accordingly
        existingProduct.setTitle(archivedProduct.getTitle());
        existingProduct.setDescription(archivedProduct.getDescription());
        existingProduct.setCategory(archivedProduct.getCategory());
        existingProduct.setPrice(archivedProduct.getPrice());
        existingProduct.setFinalSoldPrice(archivedProduct.getFinalSoldPrice());
        existingProduct.setSellerId(archivedProduct.getSellerId());
        existingProduct.setBuyerId(archivedProduct.getBuyerId());
        existingProduct.setListingDate(archivedProduct.getListingDate());
        existingProduct.setStatusChangeDate(archivedProduct.getStatusChangeDate());
        existingProduct.setStatus(archivedProduct.getStatus());
        existingProduct.setReasonForRemoval(archivedProduct.getReasonForRemoval());
        existingProduct.setConfirmationStatus(archivedProduct.getConfirmationStatus());
        existingProduct.setInterestedBuyers(archivedProduct.getInterestedBuyers());
        existingProduct.setDealCompletionTime(archivedProduct.getDealCompletionTime());
        existingProduct.setUniversityId(archivedProduct.getUniversityId());
        // Note: createdAt is usually not updated

        return archivedProductsRepository.save(existingProduct);
    }

    @Override
    public void deleteArchivedProduct(int id) {
        ArchivedProducts product = archivedProductsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        archivedProductsRepository.delete(product);
    }

}
