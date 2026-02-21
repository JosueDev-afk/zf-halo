import type {
  IAuthRepository,
  LoginInput,
  RegisterInput,
} from "@/domain/auth/repositories/auth.repository.interface";
import type { AuthResponse, User } from "@/domain/auth/models/user.model";
import { apiClient } from "@/infrastructure/http/client";
import type { AxiosResponse } from "axios";

export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const response: AxiosResponse<{ accessToken: string; user: User }> =
      await apiClient.post("/auth/login", credentials);
    return {
      token: response.data.accessToken,
      user: response.data.user,
    };
  }

  async register(data: RegisterInput): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.post(
      "/auth/register",
      data,
    );
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get("/users/me");
    return response.data;
  }

  async logout(): Promise<void> {
    // If backend has logout endpoint (blacklist/cookie), call it.
    // Else just client side.
    // await apiClient.post('/auth/logout');
    return Promise.resolve();
  }
}
