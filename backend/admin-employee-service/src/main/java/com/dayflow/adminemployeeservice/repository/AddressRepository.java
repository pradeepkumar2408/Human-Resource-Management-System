package com.dayflow.adminemployeeservice.repository;

import com.dayflow.adminemployeeservice.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
