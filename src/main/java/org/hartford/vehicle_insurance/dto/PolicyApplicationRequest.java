package org.hartford.vehicle_insurance.dto;


import java.time.LocalDate;
import java.util.List;

public class PolicyApplicationRequest {

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> addOnIds;

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<Long> getAddOnIds() {
        return addOnIds;
    }

    public void setAddOnIds(List<Long> addOnIds) {
        this.addOnIds = addOnIds;
    }
}
