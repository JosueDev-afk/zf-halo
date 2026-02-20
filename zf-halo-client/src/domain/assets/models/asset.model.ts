// ─── Enums ─────────────────────────────────────────

export const MachineStatus = {
    OPERATIVE: 'OPERATIVE',
    IN_MAINTENANCE: 'IN_MAINTENANCE',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE',
    CALIBRATION: 'CALIBRATION',
    LOANED: 'LOANED',
    DECOMMISSIONED: 'DECOMMISSIONED',
    IN_TRANSIT: 'IN_TRANSIT',
    IN_CUSTOMS: 'IN_CUSTOMS',
    UNDER_EVALUATION: 'UNDER_EVALUATION',
    CANNIBALIZED: 'CANNIBALIZED',
    IMPAIRMENT: 'IMPAIRMENT',
} as const;

export type MachineStatus = (typeof MachineStatus)[keyof typeof MachineStatus];

/** Spanish display labels for MachineStatus */
export const MachineStatusLabel: Record<MachineStatus, string> = {
    OPERATIVE: 'Operativa',
    IN_MAINTENANCE: 'En Mantenimiento',
    OUT_OF_SERVICE: 'Fuera de Servicio',
    CALIBRATION: 'Calibración',
    LOANED: 'Prestada',
    DECOMMISSIONED: 'Dada de Baja',
    IN_TRANSIT: 'En Tránsito',
    IN_CUSTOMS: 'En Aduana',
    UNDER_EVALUATION: 'En Evaluación',
    CANNIBALIZED: 'Canibalizada',
    IMPAIRMENT: 'Impairment',
};

export const MachineStatusColor: Record<MachineStatus, string> = {
    OPERATIVE: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20',
    IN_MAINTENANCE: 'bg-amber-500/15 text-amber-400 ring-amber-500/20',
    OUT_OF_SERVICE: 'bg-red-500/15 text-red-400 ring-red-500/20',
    CALIBRATION: 'bg-blue-500/15 text-blue-400 ring-blue-500/20',
    LOANED: 'bg-purple-500/15 text-purple-400 ring-purple-500/20',
    DECOMMISSIONED: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/20',
    IN_TRANSIT: 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/20',
    IN_CUSTOMS: 'bg-orange-500/15 text-orange-400 ring-orange-500/20',
    UNDER_EVALUATION: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/20',
    CANNIBALIZED: 'bg-rose-500/15 text-rose-400 ring-rose-500/20',
    IMPAIRMENT: 'bg-pink-500/15 text-pink-400 ring-pink-500/20',
};

export const PurchaseType = {
    IMPORT: 'IMPORT',
    NATIONAL: 'NATIONAL',
} as const;

export type PurchaseType = (typeof PurchaseType)[keyof typeof PurchaseType];

export const PurchaseTypeLabel: Record<PurchaseType, string> = {
    IMPORT: 'Importación',
    NATIONAL: 'Nacional',
};

export const NationalType = {
    OWN: 'OWN',
    TEMPORARY: 'TEMPORARY',
    DEFINITIVE: 'DEFINITIVE',
} as const;

export type NationalType = (typeof NationalType)[keyof typeof NationalType];

export const NationalTypeLabel: Record<NationalType, string> = {
    OWN: 'Propia',
    TEMPORARY: 'Temporal',
    DEFINITIVE: 'Definitiva',
};

// ─── Model ─────────────────────────────────────────

export interface Asset {
    id: string;
    identifier: number;
    area: string;
    subArea: string;
    category: string;
    initialQuantity: number | null;
    currentQuantity: number | null;
    projectName: string;
    machineName: string;
    tag: string;
    serialNumber: string;
    model: string;
    brand: string;
    year: number | null;
    customsDocument: string | null;
    invoice: string | null;
    commercialValue: number;
    purchaseDate: string | null;
    description: string | null;
    comments: string | null;
    purchaseType: PurchaseType;
    nationalType: NationalType | null;
    machineStatus: MachineStatus;
    isPurchased: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Input Types ───────────────────────────────────

export interface CreateAssetInput {
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
    purchaseDate?: string | null;
    description?: string | null;
    comments?: string | null;
    purchaseType: PurchaseType;
    nationalType?: NationalType | null;
    machineStatus?: MachineStatus;
    isPurchased?: boolean;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;
