package com.dayflow.auth.repository;

import com.dayflow.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    @Query("SELECT r FROM Role r WHERE UPPER(r.roleName) = UPPER(:roleName)")
    Optional<Role> findByRoleName(@Param("roleName") String roleName);
}
