package com.examly.springapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseRequestDto {
    @NotBlank
    @Size(max = 500)
    private String message;

    @NotBlank
    @Size(min = 2, max = 50)
    private String respondedBy;
}
