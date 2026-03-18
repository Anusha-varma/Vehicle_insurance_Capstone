package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MyUserRepo extends JpaRepository<MyUser,Long> {
    Optional<MyUser> findByUsername(String username);

}
