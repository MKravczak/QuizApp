package com.example.userservice.service;

import com.example.userservice.dto.request.LoginRequest;
import com.example.userservice.dto.request.SignupRequest;
import com.example.userservice.dto.request.TokenRefreshRequest;
import com.example.userservice.dto.response.JwtResponse;
import com.example.userservice.dto.response.MessageResponse;
import com.example.userservice.dto.response.TokenRefreshResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    
    MessageResponse registerUser(SignupRequest signupRequest);
    
    TokenRefreshResponse refreshToken(TokenRefreshRequest request);
    
    MessageResponse logoutUser(String refreshToken);
} 