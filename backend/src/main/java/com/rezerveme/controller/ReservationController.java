package com.rezerveme.controller;

import com.rezerveme.entity.Reservation;
import com.rezerveme.entity.Space;
import com.rezerveme.repository.ReservationRepository;
import com.rezerveme.repository.SpaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SpaceRepository spaceRepository;

    @GetMapping
    public ResponseEntity<List<Reservation>> getReservationsByUser(@RequestParam String userEmail) {
        List<Reservation> reservations = reservationRepository.findByUserEmail(userEmail);
        return ResponseEntity.ok(reservations);
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Reservation reservation) {
        // Validate reservation date is provided
        if (reservation.getReservationDate() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Reservation date is required");
        }

        // Check if space exists
        Optional<Space> spaceOpt = spaceRepository.findById(reservation.getSpaceId());
        if (spaceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Space not found with id: " + reservation.getSpaceId());
        }

        Space space = spaceOpt.get();
        
        // Check if space is at capacity for the specific date
        long currentReservations = reservationRepository.countBySpaceIdAndReservationDate(
            reservation.getSpaceId(), 
            reservation.getReservationDate()
        );
        if (currentReservations >= space.getCapacity()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Space is at capacity for this date. Current reservations: " + currentReservations + ", Capacity: " + space.getCapacity());
        }

        // Create reservation
        Reservation savedReservation = reservationRepository.save(reservation);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReservation);
    }
}
