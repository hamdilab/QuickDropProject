package Repositories;

import Models.Delivery;
import Models.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {


    List<Delivery> findByClientId(String clientId);


    List<Delivery> findByDeliveryPerson(String deliveryPerson);


    List<Delivery> findByStatus(DeliveryStatus status);
}