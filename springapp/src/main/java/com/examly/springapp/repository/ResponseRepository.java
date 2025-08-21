package com.examly.springapp.repository;

import com.examly.springapp.model.Response;
import com.examly.springapp.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findByTicketOrderByRespondedAtDesc(Ticket ticket);
}
