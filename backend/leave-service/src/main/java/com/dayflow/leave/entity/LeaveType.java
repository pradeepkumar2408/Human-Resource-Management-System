package com.dayflow.leave.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "LEAVE_TYPE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "LEAVE_TYPE_ID")
    private Long leaveTypeId;

    @Column(name = "TYPE_NAME", nullable = false, length = 50)
    private String typeName; // SICK_LEAVE, CASUAL_LEAVE, ANNUAL_LEAVE, MATERNITY_LEAVE

    @Column(name = "MAX_DAYS")
    private Integer maxDays;
}
