import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsDateString,
    Min,
} from 'class-validator';
import {
    MachineStatus,
    PurchaseType,
    NationalType,
} from '@generated/prisma';

export class CreateAssetDto {
    @ApiProperty({ example: 1001, description: 'Unique asset identifier number' })
    @IsInt()
    @Min(1)
    identifier: number;

    @ApiProperty({ example: 'Producción', description: 'Area where the asset is located' })
    @IsString()
    @IsNotEmpty()
    area: string;

    @ApiProperty({ example: 'Línea 1', description: 'Sub-area within the area' })
    @IsString()
    @IsNotEmpty()
    subArea: string;

    @ApiProperty({ example: 'Maquinaria', description: 'Asset category' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional({ example: 10, description: 'Initial quantity (spare parts only)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    initialQuantity?: number;

    @ApiPropertyOptional({ example: 8, description: 'Current quantity (spare parts only)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    currentQuantity?: number;

    @ApiProperty({ example: 'ADAS Phase 2', description: 'Project name' })
    @IsString()
    @IsNotEmpty()
    projectName: string;

    @ApiProperty({ example: 'Camera Calibration Station', description: 'Machine name' })
    @IsString()
    @IsNotEmpty()
    machineName: string;

    @ApiProperty({ example: 'ZF-CAM-001', description: 'Unique QR tag code' })
    @IsString()
    @IsNotEmpty()
    tag: string;

    @ApiProperty({ example: 'SN-2024-001', description: 'Unique serial number' })
    @IsString()
    @IsNotEmpty()
    serialNumber: string;

    @ApiProperty({ example: 'CalStation X200', description: 'Model name' })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiProperty({ example: 'Zeiss', description: 'Brand name' })
    @IsString()
    @IsNotEmpty()
    brand: string;

    @ApiPropertyOptional({ example: 2024, description: 'Year of manufacture' })
    @IsOptional()
    @IsInt()
    year?: number;

    @ApiPropertyOptional({ example: 'PED-2024-1234', description: 'Customs document (pedimento)' })
    @IsOptional()
    @IsString()
    customsDocument?: string;

    @ApiPropertyOptional({ example: 'FAC-2024-5678', description: 'Invoice number (factura)' })
    @IsOptional()
    @IsString()
    invoice?: string;

    @ApiProperty({ example: 150000.50, description: 'Commercial value in MXN' })
    @IsNumber()
    @Min(0)
    commercialValue: number;

    @ApiPropertyOptional({ example: '2024-06-15', description: 'Purchase date (ISO format)' })
    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @ApiPropertyOptional({ example: 'High-precision calibration station for ADAS cameras' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Requires annual calibration' })
    @IsOptional()
    @IsString()
    comments?: string;

    @ApiProperty({ enum: PurchaseType, example: 'IMPORT', description: 'Import or National' })
    @IsEnum(PurchaseType)
    purchaseType: PurchaseType;

    @ApiPropertyOptional({ enum: NationalType, example: 'OWN', description: 'National sub-type' })
    @IsOptional()
    @IsEnum(NationalType)
    nationalType?: NationalType;

    @ApiPropertyOptional({ enum: MachineStatus, example: 'OPERATIVE', description: 'Machine status' })
    @IsOptional()
    @IsEnum(MachineStatus)
    machineStatus?: MachineStatus;

    @ApiPropertyOptional({ example: true, description: 'Whether this asset was purchased' })
    @IsOptional()
    @IsBoolean()
    isPurchased?: boolean;
}
