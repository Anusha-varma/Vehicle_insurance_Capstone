package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.AddOnRepo;
import org.hartford.vehicle_insurance.model.AddOn;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class AddOnService {
    private final AddOnRepo addOnRepo;

    public AddOnService(AddOnRepo addOnRepo) {
        this.addOnRepo = addOnRepo;
    }

    public AddOn createAddOn(AddOn addOn) {
        addOn.setCreatedDate(LocalDateTime.now());
        addOn.setUpdatedDate(LocalDateTime.now());
        return addOnRepo.save(addOn);
    }

    public List<AddOn> getAllAddOns() {
        return addOnRepo.findByIsActiveTrue();
    }

    public Optional<AddOn> getAddOnById(Long id) {
        return addOnRepo.findById(id);
    }

    public AddOn updateAddOn(Long id, AddOn addOn) {
        Optional<AddOn> existingAddOn = addOnRepo.findById(id);
        if (existingAddOn.isPresent()) {
            AddOn addon = existingAddOn.get();
            addon.setName(addOn.getName());
            addon.setDescription(addOn.getDescription());
            addon.setPrice(addOn.getPrice());
            addon.setIsActive(addOn.getIsActive());
            addon.setUpdatedDate(LocalDateTime.now());
            return addOnRepo.save(addon);
        }
        return null;
    }

    public void deleteAddOn(Long id) {
        addOnRepo.deleteById(id);
    }
}
