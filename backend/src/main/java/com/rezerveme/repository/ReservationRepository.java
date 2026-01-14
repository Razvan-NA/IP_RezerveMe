package com.rezerveme.repository;

import com.rezerveme.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserEmail(String userEmail);
    long countBySpaceId(Long spaceId);
    long countBySpaceIdAndReservationDate(Long spaceId, LocalDate reservationDate);
}
