package com.examly.springapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketStatusUpdateDto {
    @NotNull
    private String status;
}
