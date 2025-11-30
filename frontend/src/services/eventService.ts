import { apiClient } from './apiClient';
import {
  Event,
  CreateEventDto,
  PaginatedResponse,
  FilterEventsDto,
  EventStats,
  EventStatus,
} from '../types';

export const eventService = {
  async getAll(filters?: FilterEventsDto): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<PaginatedResponse<Event>>('/events', filters);
    return response.data;
  },

  async getOne(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  async create(data: CreateEventDto): Promise<Event> {
    const response = await apiClient.post<Event>('/events', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEventDto>): Promise<Event> {
    const response = await apiClient.patch<Event>(`/events/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async getUpcoming(limit: number = 10): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events/upcoming', { limit });
    return response.data;
  },

  async getPast(limit: number = 10): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events/past', { limit });
    return response.data;
  },

  async getStats(id: string): Promise<EventStats> {
    const response = await apiClient.get<EventStats>(`/events/${id}/stats`);
    return response.data;
  },

  async changeStatus(id: string, status: EventStatus): Promise<Event> {
    const response = await apiClient.patch<Event>(`/events/${id}/status`, { status });
    return response.data;
  },
};
