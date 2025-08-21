package com.examly.springapp.service;

import com.examly.springapp.model.Ticket;
import com.examly.springapp.model.Response;
import com.examly.springapp.repository.TicketRepository;
import com.examly.springapp.repository.ResponseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.EntityNotFoundException;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final ResponseRepository responseRepository;

    public TicketService(TicketRepository ticketRepository, ResponseRepository responseRepository) {
        this.ticketRepository = ticketRepository;
        this.responseRepository = responseRepository;
    }

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getSubject() == null || ticket.getSubject().length() < 5 || ticket.getSubject().length() > 100) {
            throw new IllegalArgumentException("subject: size must be between 5 and 100");
        }
        if (ticket.getDescription() == null || ticket.getDescription().length() < 10 || ticket.getDescription().length() > 1000) {
            throw new IllegalArgumentException("description: size must be between 10 and 1000");
        }
        if (ticket.getCreatedBy() == null || ticket.getCreatedBy().length() < 2 || ticket.getCreatedBy().length() > 50) {
            throw new IllegalArgumentException("createdBy: size must be between 2 and 50");
        }
        ticket.setStatus(Ticket.TicketStatus.OPEN);
        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId);
    }

    @Transactional
    public Ticket updateTicketStatus(Long ticketId, Ticket.TicketStatus status) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            // The tests expect NOT_FOUND for unknown ticket
            throw new EntityNotFoundException("Ticket not found");
        }
        Ticket ticket = ticketOpt.get();
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Response addResponseToTicket(Long ticketId, Response response) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(EntityNotFoundException::new);
        response.setTicket(ticket);
        response.setRespondedAt(LocalDateTime.now());
        if (response.getMessage() == null || response.getMessage().isEmpty() || response.getMessage().length() > 500) {
            throw new IllegalArgumentException("message: size must be at most 500");
        }
        if (response.getRespondedBy() == null || response.getRespondedBy().length() < 2 || response.getRespondedBy().length() > 50) {
            throw new IllegalArgumentException("respondedBy: size must be between 2 and 50");
        }
        Response savedResponse = responseRepository.save(response);
        if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
            ticket.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket);
        }
        return savedResponse;
    }

    public List<Response> getResponsesForTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(EntityNotFoundException::new);
        return responseRepository.findByTicketOrderByRespondedAtDesc(ticket);
    }
}
