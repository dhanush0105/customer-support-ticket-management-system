package com.examly.springapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketRequestDto {
    @NotBlank
    @Size(min = 5, max = 100)
    private String subject;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    @NotNull
    private String priority;
  
    @NotBlank
    @Size(min = 2, max = 50)
    private String createdBy;
}
