package org.hartford.vehicle_insurance.dto;
public class PremiumBreakdownDTO {

    private String policyName;
    private String vehicleNumber;
    private String vehicleModel;
    private int vehicleYear;

    private double basePremium;
    private double vehicleAgeFactor;
    private double riskScore;
    private double riskMultiplier;

    private double calculatedPremium;

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
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

    public int getVehicleYear() {
        return vehicleYear;
    }

    public void setVehicleYear(int vehicleYear) {
        this.vehicleYear = vehicleYear;
    }

    public double getBasePremium() {
        return basePremium;
    }

    public void setBasePremium(double basePremium) {
        this.basePremium = basePremium;
    }

    public double getVehicleAgeFactor() {
        return vehicleAgeFactor;
    }

    public void setVehicleAgeFactor(double vehicleAgeFactor) {
        this.vehicleAgeFactor = vehicleAgeFactor;
    }

    public double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(double riskScore) {
        this.riskScore = riskScore;
    }

    public double getRiskMultiplier() {
        return riskMultiplier;
    }

    public void setRiskMultiplier(double riskMultiplier) {
        this.riskMultiplier = riskMultiplier;
    }

    public double getCalculatedPremium() {
        return calculatedPremium;
    }

    public void setCalculatedPremium(double calculatedPremium) {
        this.calculatedPremium = calculatedPremium;
    }
// getters setters
}