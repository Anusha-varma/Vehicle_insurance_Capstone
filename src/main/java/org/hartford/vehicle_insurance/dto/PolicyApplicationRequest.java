package org.hartford.vehicle_insurance.dto;


import java.time.LocalDate;
import java.util.List;

public class PolicyApplicationRequest {

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> addOnIds;
    private String vehicleNumber;
    private String vehicleModel;
    private Integer vehicleYear;
    private Double riskScore;

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

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public Integer getVehicleYear() {
        return vehicleYear;
    }

    public void setVehicleYear(Integer vehicleYear) {
        this.vehicleYear = vehicleYear;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }
}
