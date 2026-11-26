export interface Complaint {
  complaintId: number;
  description?: string;
  complaintDateTime?: string;
  complaintStatus?: string;
  serviceName?: string;
  complaintImgs?: string[];
  adminToTourist?: string;
  complaintResult?: 'REFUND' | 'REJECT' | 'COMPENSATE' | string;
  refundStatus?: string;
  bookingId?: number;
}

export interface ComplaintResponse {
  complaints: Complaint[];
  total: number;
}
