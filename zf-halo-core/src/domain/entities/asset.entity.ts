/**
 * Domain Entity: Asset
 * Pure domain object representing an asset in the ZF-HALO catalog.
 * Framework-agnostic, no Prisma or NestJS dependencies.
 */

export type MachineStatus =
  | 'OPERATIVE'
  | 'IN_MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'CALIBRATION'
  | 'LOANED'
  | 'DECOMMISSIONED'
  | 'IN_TRANSIT'
  | 'IN_CUSTOMS'
  | 'UNDER_EVALUATION'
  | 'CANNIBALIZED'
  | 'IMPAIRMENT';

export type PurchaseType = 'IMPORT' | 'NATIONAL';

export type NationalType = 'OWN' | 'TEMPORARY' | 'DEFINITIVE';

export type AssetType = 'SERIALIZED' | 'BULK';

export interface Asset {
  readonly id: string;
  readonly identifier: number;
  readonly area: string;
  readonly subArea: string;
  readonly category: string;
  readonly initialQuantity: number | null;
  readonly currentQuantity: number | null;
  readonly projectName: string;
  readonly machineName: string;
  readonly tag: string;
  readonly serialNumber: string;
  readonly model: string;
  readonly brand: string;
  readonly year: number | null;
  readonly customsDocument: string | null;
  readonly invoice: string | null;
  readonly commercialValue: number;
  readonly purchaseDate: Date | null;
  readonly description: string | null;
  readonly comments: string | null;
  readonly purchaseType: PurchaseType;
  readonly nationalType: NationalType | null;
  readonly machineStatus: MachineStatus;
  readonly assetType: AssetType;
  readonly isPurchased: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data required to create a new asset (without auto-generated fields)
 */
export interface CreateAssetData {
  identifier: number;
  area: string;
  subArea: string;
  category: string;
  initialQuantity?: number | null;
  currentQuantity?: number | null;
  projectName: string;
  machineName: string;
  tag: string;
  serialNumber: string;
  model: string;
  brand: string;
  year?: number | null;
  customsDocument?: string | null;
  invoice?: string | null;
  commercialValue: number;
  purchaseDate?: Date | null;
  description?: string | null;
  comments?: string | null;
  purchaseType: PurchaseType;
  nationalType?: NationalType | null;
  machineStatus?: MachineStatus;
  assetType?: AssetType;
  isPurchased?: boolean;
}

/**
 * Data for updating an existing asset (all fields optional)
 */
export type UpdateAssetData = Partial<CreateAssetData>;
