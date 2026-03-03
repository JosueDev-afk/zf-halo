import type { User } from "../auth/models/user.model";
import type { Asset, Destination } from "../assets/models/asset.model";

export type LoanStatus =
  | "REQUESTED"
  | "AUTHORIZED"
  | "CHECKED_OUT"
  | "RETURNED"
  | "REJECTED";

export interface Loan {
  id: string;
  folio: string;
  status: LoanStatus;
  quantity: number;
  estimatedReturnDate: string;
  departureDate?: string | null;
  actualReturnDate?: string | null;
  comments?: string | null;
  requesterId: string;
  authorizerId?: string | null;
  assetId: string;
  destinationId: string;
  createdAt: string;
  updatedAt: string;

  // Potential relations returned by backend
  requester?: User;
  authorizer?: User | null;
  asset?: Asset;
  destination?: Destination;
}

export interface CreateLoanDto {
  assetId: string;
  destinationId: string;
  estimatedReturnDate: string;
  quantity?: number;
  comments?: string;
  /** Admin only: create loan on behalf of another user */
  requesterId?: string;
}

export interface AuthorizeLoanDto {
  comments?: string;
}

export interface CheckOutLoanDto {
  comments?: string;
}

export interface CheckInLoanDto {
  comments?: string;
}
