package com.weeklyreport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Join table that tracks which users are assigned to which projects.
 * The assigned_date records when the assignment was made.
 */
@Entity
@Table(
    name = "user_projects",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_user_project",
            columnNames = {"user_id", "project_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProject {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false,
            columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_project_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_project_project"))
    private Project project;

    @Column(name = "assigned_date", nullable = false)
    @Builder.Default
    private LocalDate assignedDate = LocalDate.now();
}
