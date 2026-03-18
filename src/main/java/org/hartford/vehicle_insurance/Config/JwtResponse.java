package org.hartford.vehicle_insurance.Config;

public class JwtResponse {
    private String token;
    private String roles;

    public JwtResponse(String token, String roles) {
        this.token = token;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public String getRoles() {
        return roles;
    }
}