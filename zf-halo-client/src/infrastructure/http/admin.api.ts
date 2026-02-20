import type { User, Role } from "@/domain/auth/models/user.model"
import { apiClient } from "@/infrastructure/http/client"
import type { AxiosResponse } from "axios"

export interface AccountRequest {
    id: string
    email: string
    firstName: string
    lastName: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    createdAt: string
    updatedAt: string
}

export const adminApi = {
    /** GET /users — list all users (Admin only) */
    async getUsers(): Promise<User[]> {
        const res: AxiosResponse<User[]> = await apiClient.get("/users")
        return res.data
    },

    /** GET /users/:id — get user by ID (Admin only) */
    async getUserById(id: string): Promise<User> {
        const res: AxiosResponse<User> = await apiClient.get(`/users/${id}`)
        return res.data
    },

    /** DELETE /users/:id — deactivate user (Admin only) */
    async deactivateUser(id: string): Promise<void> {
        await apiClient.delete(`/users/${id}`)
    },

    /** GET /accounts/requests — list pending account requests (Admin only) */
    async getAccountRequests(): Promise<AccountRequest[]> {
        const res: AxiosResponse<AccountRequest[]> = await apiClient.get("/accounts/requests")
        return res.data
    },

    /** PATCH /accounts/:id/approve — approve account request (Admin only) */
    async approveAccount(id: string, role: Role): Promise<void> {
        await apiClient.patch(`/accounts/${id}/approve`, { role })
    },
}
