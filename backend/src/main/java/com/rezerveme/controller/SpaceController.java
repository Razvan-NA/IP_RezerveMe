package com.rezerveme.controller;

import com.rezerveme.entity.Space;
import com.rezerveme.repository.SpaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spaces")
@CrossOrigin(origins = "*")
public class SpaceController {

    @Autowired
    private SpaceRepository spaceRepository;

    @GetMapping
    public ResponseEntity<List<Space>> getAllSpaces() {
        List<Space> spaces = spaceRepository.findAll();
        return ResponseEntity.ok(spaces);
    }

    @PostMapping
    public ResponseEntity<Space> createSpace(@RequestBody Space space) {
        // TODO: Add admin check before allowing space creation
        Space savedSpace = spaceRepository.save(space);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSpace);
    }
}
