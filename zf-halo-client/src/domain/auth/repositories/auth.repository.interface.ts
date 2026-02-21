import type { AuthResponse, User } from "../models/user.model";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export interface IAuthRepository {
  login(credentials: LoginInput): Promise<AuthResponse>;
  register(data: RegisterInput): Promise<User>; // Or AuthResponse if auto-login
  getProfile(): Promise<User>;
  logout(): Promise<void>;
}
