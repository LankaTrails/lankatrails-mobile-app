import { Update } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';
import { Phone } from 'lucide-react-native';

// Types for API responses
interface SignUpResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
  };
}

interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data: {
    firstName: string;
    lastName: string;
    phone: string;
  };
} 

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export async function signUp(
  firstName: string,
  lastName: string,
  country: string,
  email: string,
  password: string,
): Promise<SignUpResponse> {
  try {
    const response = await api.post<SignUpResponse>('/auth/signup/tourist', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      country: country.trim(),
    });

    // Check if the API response indicates success
    if (!response.data.success) {
      throw new Error(response.data.message || 'Sign up failed');
    }

    return response.data;
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // API returned an error response
      const apiError: ApiError = {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      };

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 400:
          throw new Error(apiError.message || 'Invalid input data');
        case 409:
          throw new Error('An account with this email already exists');
        case 422:
          throw new Error('Invalid data provided. Please check your inputs');
        case 500:
          throw new Error('Server error. Please try again later');
        default:
          throw new Error(apiError.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection');
    } else if (error.message) {
      // Validation or other custom errors
      throw error;
    } else {
      // Unknown error
      throw new Error('An unexpected error occurred. Please try again');
    }
  }
}

//update user profile
export async function updateUserProfile(
  firstName: string,
  lastName: string,
  phone: string,
  role: string,
): Promise<UpdateUserProfileResponse> {
  try {
    console.log('Updating user profile:', { firstName, lastName, phone, role });
    const response = await api.put<UpdateUserProfileResponse>(`/tourist/update-profile`, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      role: role.trim(),
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Update failed');
    }
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const apiError: ApiError = {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      };
      switch (error.response.status) {
        case 400:
          throw new Error(apiError.message || 'Invalid input data');
        case 404:
          throw new Error('User not found');
        case 422:
          throw new Error('Invalid data provided. Please check your inputs');
        case 500:
          throw new Error('Server error. Please try again later');
        default:
          throw new Error(apiError.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred. Please try again');
    }
  }
}
