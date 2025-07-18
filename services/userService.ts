import api from '../api/axiosInstance';

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

interface ChangePasswordResponse {
  success: boolean,
  message: string,
}

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

interface AddProfilePictureResponse {
  success: boolean;
  message: string;
  data: {
    profilePicUrl: string;
  };
}

export async function signUp(
  firstName: string,
  lastName: string,
  country: string,
  email: string,
  phone: string,
  password: string,
): Promise<SignUpResponse> {
  try {
    const response = await api.post<SignUpResponse>('/auth/signup/tourist', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phoneNumber: phone.trim(),
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
  country: string,
  role: string = "ROLE_TOURIST",
): Promise<UpdateUserProfileResponse> {
  try {
    console.log('Updating user profile:', { firstName, lastName, phone, country, role });
    const response = await api.put<UpdateUserProfileResponse>(`/tourist/update-profile`, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phone.trim(),
      country: country.trim(),
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

// Add profile picture
export async function addProfilePicture(
  userId: number,
  imageUri: string,
  fileName?: string
): Promise<AddProfilePictureResponse> {
  try {
    console.log('Uploading profile picture for user:', userId);

    // Create FormData for multipart file upload
    const formData = new FormData();

    // Extract file extension from URI or use default
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const defaultFileName = `profile_${userId}.${fileExtension}`;

    formData.append('profilePicture', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName || defaultFileName,
    } as any);

    const response = await api.post<AddProfilePictureResponse>(
      `user/${userId}/add-profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Profile picture upload failed');
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
          throw new Error(apiError.message || 'Invalid image file');
        case 404:
          throw new Error('User not found');
        case 413:
          throw new Error('Image file is too large');
        case 415:
          throw new Error('Unsupported image format');
        case 422:
          throw new Error('Invalid image data. Please try another image');
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

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<ChangePasswordResponse> {
  try {
    // Client-side validation
    if (!oldPassword || !newPassword) {
      throw new Error('Both old and new passwords are required');
    }

    if (oldPassword.trim().length < 6) {
      throw new Error('Current password must be at least 6 characters');
    }

    if (newPassword.trim().length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    if (oldPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    console.log('Changing password for user');
    const response = await api.put<ChangePasswordResponse>(`/auth/change-password`, {
      oldPassword: oldPassword.trim(),
      newPassword: newPassword.trim()
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
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
          throw new Error(apiError.message || 'Invalid password data');
        case 401:
          throw new Error('Current password is incorrect');
        case 403:
          throw new Error('Password change not allowed');
        case 404:
          throw new Error('User not found');
        case 422:
          throw new Error(apiError.message || 'Password does not meet requirements');
        case 429:
          throw new Error('Too many password change attempts. Please try again later');
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