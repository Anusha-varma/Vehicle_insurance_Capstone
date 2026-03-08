package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.AddOn;
import org.hartford.vehicle_insurance.service.AddOnService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/addon")
public class AddOnController {
    private final AddOnService addOnService;

    public AddOnController(AddOnService addOnService) {
        this.addOnService = addOnService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public AddOn createAddOn(@RequestBody AddOn addOn) {
        return addOnService.createAddOn(addOn);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    @GetMapping("/all")
    public List<AddOn> getAllAddOns() {
        return addOnService.getAllAddOns();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    @GetMapping("/{id}")
    public Optional<AddOn> getAddOnById(@PathVariable Long id) {
        return addOnService.getAddOnById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public AddOn updateAddOn(@PathVariable Long id, @RequestBody AddOn addOn) {
        return addOnService.updateAddOn(id, addOn);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteAddOn(@PathVariable Long id) {
        addOnService.deleteAddOn(id);
    }
}
