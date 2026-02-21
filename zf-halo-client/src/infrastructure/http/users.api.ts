import type { User, Role } from "@/domain/auth/models/user.model";
import type {
  PaginatedResult,
  PaginationQuery,
} from "@/domain/common/models/pagination.model";
import { apiClient } from "@/infrastructure/http/client";
import type { AxiosResponse } from "axios";

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
  company?: string;
}

export const usersApi = {
  /** GET /users — get paginated users (Admin only) */
  async getUsers(query?: PaginationQuery): Promise<PaginatedResult<User>> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());

    const res: AxiosResponse<PaginatedResult<User>> = await apiClient.get(
      `/users?${params.toString()}`,
    );
    return res.data;
  },

  /** PATCH /users/me — update current user profile */
  async updateProfile(data: UpdateUserProfileInput): Promise<User> {
    const res: AxiosResponse<User> = await apiClient.patch("/users/me", data);
    return res.data;
  },

  /** PATCH /users/:id — update user (Admin only) */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const res: AxiosResponse<User> = await apiClient.patch(
      `/users/${id}`,
      data,
    );
    return res.data;
  },
};
