package com.nd.controller;

import com.nd.entities.ArchivedProducts;
import com.nd.service.ArchivedProductsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archived-products")
public class ArchivedProductsController {

    @Autowired
    private final ArchivedProductsService archivedProductsService;

    public ArchivedProductsController(ArchivedProductsService archivedProductsService) {
        this.archivedProductsService = archivedProductsService;
    }


    // GET all archived products
    @GetMapping
    public ResponseEntity<List<ArchivedProducts>> getAllArchivedProducts() {
        return ResponseEntity.ok(archivedProductsService.getAllArchivedProducts());
    }

    // GET a product by id
    @GetMapping("/{id}")
    public ResponseEntity<ArchivedProducts> getArchivedProductById(@PathVariable int id) {
        return ResponseEntity.ok(archivedProductsService.getArchivedProductById(id));
    }

    // POST create a new archived product
    @PostMapping
    public ResponseEntity<ArchivedProducts> createArchivedProduct(@RequestBody ArchivedProducts archivedProduct) {
        return ResponseEntity.ok(archivedProductsService.createArchivedProduct(archivedProduct));
    }

    // PUT update an existing product
    @PutMapping("/{id}")
    public ResponseEntity<ArchivedProducts> updateArchivedProduct(@PathVariable int id,
                                                                  @RequestBody ArchivedProducts archivedProduct) {
        return ResponseEntity.ok(archivedProductsService.updateArchivedProduct(id, archivedProduct));
    }

    // DELETE an archived product by id
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseEntity<?>> deleteArchivedProduct(@PathVariable int id) {
        archivedProductsService.deleteArchivedProduct(id);
        return ResponseEntity.ok().build();
    }
}