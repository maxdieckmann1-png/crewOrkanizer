import { apiClient } from './apiClient';
import {
  Shift,
  CreateShiftDto,
  ShiftApplication,
  ApplyShiftDto,
  ReviewApplicationDto,
  ShiftStats,
} from '../types';

export const shiftService = {
  async getAll(filters?: {
    eventId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Shift[]> {
    const response = await apiClient.get<Shift[]>('/shifts', filters);
    return response.data;
  },

  async getOne(id: string): Promise<Shift> {
    const response = await apiClient.get<Shift>(`/shifts/${id}`);
    return response.data;
  },

  async create(data: CreateShiftDto): Promise<Shift> {
    const response = await apiClient.post<Shift>('/shifts', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateShiftDto>): Promise<Shift> {
    const response = await apiClient.patch<Shift>(`/shifts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/shifts/${id}`);
  },

  async getMyShifts(): Promise<Shift[]> {
    const response = await apiClient.get<Shift[]>('/shifts/my-shifts');
    return response.data;
  },

  async getMyApplications(): Promise<ShiftApplication[]> {
    const response = await apiClient.get<ShiftApplication[]>('/shifts/my-applications');
    return response.data;
  },

  async getAvailable(): Promise<Shift[]> {
    const response = await apiClient.get<Shift[]>('/shifts/available');
    return response.data;
  },

  async getPendingApplications(): Promise<ShiftApplication[]> {
    const response = await apiClient.get<ShiftApplication[]>('/shifts/applications/pending');
    return response.data;
  },

  async getStats(): Promise<ShiftStats> {
    const response = await apiClient.get<ShiftStats>('/shifts/stats');
    return response.data;
  },

  async apply(shiftId: string, data: ApplyShiftDto): Promise<ShiftApplication> {
    const response = await apiClient.post<ShiftApplication>(
      `/shifts/${shiftId}/apply`,
      data
    );
    return response.data;
  },

  async reviewApplication(
    applicationId: string,
    data: ReviewApplicationDto
  ): Promise<ShiftApplication> {
    const response = await apiClient.post<ShiftApplication>(
      `/shifts/applications/${applicationId}/review`,
      data
    );
    return response.data;
  },

  async assignShift(shiftId: string, userId: string): Promise<Shift> {
    const response = await apiClient.post<Shift>(`/shifts/${shiftId}/assign`, {
      userId,
    });
    return response.data;
  },

  async unassignShift(shiftId: string): Promise<Shift> {
    const response = await apiClient.post<Shift>(`/shifts/${shiftId}/unassign`);
    return response.data;
  },

  async cancelApplication(applicationId: string): Promise<void> {
    await apiClient.delete(`/shifts/applications/${applicationId}`);
  },

  async getShiftApplications(shiftId: string): Promise<ShiftApplication[]> {
    const response = await apiClient.get<ShiftApplication[]>(
      `/shifts/${shiftId}/applications`
    );
    return response.data;
  },
};
