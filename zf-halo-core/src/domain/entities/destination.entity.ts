export interface Destination {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
}
