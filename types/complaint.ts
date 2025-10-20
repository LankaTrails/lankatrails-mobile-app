export interface Complaint {
  complaintId: string;
  description?: string;
  complaintDateTime?: string;
  complaintStatus?: string;
  serviceName?: string;
  complaintImgs?: string[];
  adminToTourist?: string;
  complaintResult?: string;
}

export interface ComplaintResponse {
  complaints: Complaint[];
  total: number;
}
