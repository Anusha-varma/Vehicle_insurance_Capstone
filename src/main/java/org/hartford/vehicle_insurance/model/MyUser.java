package org.hartford.vehicle_insurance.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class MyUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String username;
    String roles;

    public String getRoles() {
        return roles;
    }

    public void setRoles(String roles) {
        this.roles = roles;
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public MyUser() {
    }

    public MyUser(String username, String roles, String password, String email, String phoneNumber) {
        this.username = username;
        this.roles = roles;
        this.password = password;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public MyUser(Long id, String username, String roles, String password, String email, String phoneNumber) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.password = password;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public void setPassword(String password) {
        this.password = password;
    }




    String password;
    String email;
    String phoneNumber;

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
