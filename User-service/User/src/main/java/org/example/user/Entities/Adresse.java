package org.example.user.Entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "adresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Adresse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rue;
    private String ville;
    private String codePostal;
    private String pays;
}
