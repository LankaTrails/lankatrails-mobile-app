import api from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/commonTypes';
import type { Complaint } from '@/types/complaint';
import { logger } from "@/utils/logger";

export interface ComplaintImgDTO {
  imageUrl: string;
}

export interface ComplaintDTO {
  description: string;
  complaintImgs?: ComplaintImgDTO[];
}

export interface GeneralComplaintRequest {
  title: string;
  description: string;
  images: string[];
}

/**
 * Submit a general complaint
 * @param complaint The complaint data to submit
 * @returns Promise containing the API response
 */
export const submitGeneralComplaint = async (complaint: GeneralComplaintRequest): Promise<ApiResponse<string>> => {
  try {
    
    // Upload images first if any
    let imageUrls: string[] = [];
    if (complaint.images.length > 0) {
      const uploadResponse = await uploadComplaintImages(complaint.images);
      if (uploadResponse.success && uploadResponse.data) {
        imageUrls = uploadResponse.data;
      } else {
        throw new Error(uploadResponse.message || 'Failed to upload images');
      }
    }
    
    // Transform the complaint data to match the API structure
    const complaintDTO: ComplaintDTO = {
      description: `${complaint.title}\n\n${complaint.description}`,
      complaintImgs: imageUrls.map(imageUrl => ({ imageUrl }))
    };
    
    const response = await api.post<ApiResponse<string>>('/tourist/make-general-complaint', complaintDTO);
    return response.data;
  } catch (error) {
    logger.error('Error submitting general complaint:', error);
    throw error;
  }
};

/**
 * Upload complaint images
 * @param imageUris Array of local image URIs
 * @returns Promise containing the API response with uploaded image URLs
 */
export const uploadComplaintImages = async (imageUris: string[]): Promise<ApiResponse<string[]>> => {
  try {
    
    const formData = new FormData();
    
    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      
      // Generate a filename with timestamp
      const filename = `complaint_image_${Date.now()}_${i}.jpg`;
      
      // For React Native, we need to append files differently
      formData.append('images', {
        uri: uri,
        type: 'image/jpeg',
        name: filename,
      } as any);
    }
    
    
    const uploadResponse = await api.post<ApiResponse<string[]>>('/tourist/upload-complaint-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for image uploads
    });
    
    return uploadResponse.data;
  } catch (error: any) {
    logger.error('Error uploading complaint images:', error);
    if (error.response) {
      logger.error('Response status:', error.response.status);
      logger.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Submit a service-specific complaint
 * @param serviceId The ID of the service to complain about
 * @param complaint The complaint data to submit
 * @returns Promise containing the API response
 */
export const submitServiceComplaint = async (serviceId: number, complaint: GeneralComplaintRequest): Promise<ApiResponse<string>> => {
  try {
    
    // Upload images first if any
    let imageUrls: string[] = [];
    if (complaint.images.length > 0) {
      const uploadResponse = await uploadComplaintImages(complaint.images);
      if (uploadResponse.success && uploadResponse.data) {
        imageUrls = uploadResponse.data;
      } else {
        throw new Error(uploadResponse.message || 'Failed to upload images');
      }
    }
    
    // Transform the complaint data to match the API structure
    const complaintDTO: ComplaintDTO = {
      description: `${complaint.title}\n\n${complaint.description}`,
      complaintImgs: imageUrls.map(imageUrl => ({ imageUrl }))
    };
    
    const response = await api.post<ApiResponse<string>>(`/tourist/make-complaint/${serviceId}`, complaintDTO);
    return response.data;
  } catch (error) {
    logger.error('Error submitting service complaint:', error);
    throw error;
  }
};

/**
 * Get all complaints submitted by the current user
 * @returns Promise containing the API response with complaints array
 */
export const getMyComplaints = async (): Promise<ApiResponse<Complaint[]>> => {
  try {
    const response = await api.get<ApiResponse<Complaint[]>>('/tourist/my-complaints');
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching my complaints:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};