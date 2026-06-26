package org.example.user.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_livreur")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusLivreur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private StatusLivreurEnum status;

    private LocalDateTime dateModification;
}