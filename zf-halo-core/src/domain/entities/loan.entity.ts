import { Asset } from './asset.entity';
import { User } from './user.entity';
import { Destination } from './destination.entity';

export type LoanStatus =
  | 'REQUESTED'
  | 'AUTHORIZED'
  | 'CHECKED_OUT'
  | 'RETURNED';

export interface Loan {
  readonly id: string;
  readonly folio: string;
  readonly status: LoanStatus;
  readonly quantity: number;
  readonly estimatedReturnDate: Date;
  readonly departureDate: Date | null;
  readonly actualReturnDate: Date | null;
  readonly comments: string | null;

  readonly requesterId: string;
  readonly requester?: User;

  readonly authorizerId: string | null;
  readonly authorizer?: User;

  readonly assetId: string;
  readonly asset?: Asset;

  readonly destinationId: string;
  readonly destination?: Destination;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
