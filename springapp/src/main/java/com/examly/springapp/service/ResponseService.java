package com.examly.springapp.service;

import com.examly.springapp.model.Response;
import com.examly.springapp.model.Ticket;
import com.examly.springapp.repository.ResponseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResponseService {
    private final ResponseRepository responseRepository;

    public ResponseService(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }

    public List<Response> getResponsesByTicket(Ticket ticket) {
        return responseRepository.findByTicketOrderByRespondedAtDesc(ticket);
    }
}
