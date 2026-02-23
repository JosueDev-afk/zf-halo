export interface Destination {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
}
