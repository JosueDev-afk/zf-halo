import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ILoanRepository } from '../../../domain/repositories/loan.repository.interface';
import { LOAN_REPOSITORY } from '../../../domain/repositories/loan.repository.interface';
import type { IAssetRepository } from '../../../domain/repositories/asset.repository.interface';
import { ASSET_REPOSITORY } from '../../../domain/repositories/asset.repository.interface';
import { FolioGeneratorService } from '../../../domain/services/folio-generator.service';
import { CreateLoanDto } from '../../dtos/loan/create-loan.dto';
import { Loan } from '../../../domain/entities/loan.entity';
import { UserRole } from '../../../domain/entities/user.entity';

@Injectable()
export class RequestLoanUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: ILoanRepository,
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
    private readonly folioGenerator: FolioGeneratorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    dto: CreateLoanDto,
    actorRole?: UserRole,
  ): Promise<Loan> {
    const asset = await this.assetRepository.findById(dto.assetId);

    if (!asset || !asset.isActive) {
      throw new NotFoundException('Activo no encontrado o inactivo');
    }

    const qty = dto.quantity || 1;

    if (asset.assetType === 'BULK') {
      const currentStock = asset.currentQuantity ?? 0;
      if (currentStock <= 0) {
        throw new BadRequestException(
          'Stock agotado: no hay unidades disponibles para préstamo',
        );
      }
      if (currentStock < qty) {
        throw new BadRequestException(
          `Stock insuficiente: solo hay ${currentStock} unidad(es) disponibles`,
        );
      }
    } else {
      if (asset.machineStatus === 'LOANED') {
        throw new BadRequestException(
          'Este activo ya se encuentra en préstamo',
        );
      }
      if (qty > 1) {
        throw new BadRequestException(
          'Solo se puede solicitar 1 unidad de un activo serializado',
        );
      }
    }

    // Admins can create loans on behalf of other users by passing requesterId
    const requesterId =
      actorRole === 'ADMIN' && dto.requesterId ? dto.requesterId : userId;

    const folio = await this.folioGenerator.generateFolio();

    const loan = await this.loanRepository.create({
      folio,
      status: 'REQUESTED',
      quantity: qty,
      estimatedReturnDate: new Date(dto.estimatedReturnDate),
      comments: dto.comments,
      requesterId,
      assetId: dto.assetId,
      destinationId: dto.destinationId,
    });

    // ── Update asset stock immediately on request ──────────────────────────
    if (asset.assetType === 'BULK') {
      await this.assetRepository.update(asset.id, {
        currentQuantity: (asset.currentQuantity ?? 0) - qty,
      });
    } else {
      // Serialized: mark as LOANED so no duplicate loans
      await this.assetRepository.update(asset.id, {
        machineStatus: 'LOANED',
      });
    }

    this.eventEmitter.emit('loan.status.changed', {
      loanId: loan.id,
      status: loan.status,
      folio: loan.folio,
      requesterId: loan.requesterId,
    });

    return loan;
  }
}
