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

@Injectable()
export class RequestLoanUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: ILoanRepository,
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
    private readonly folioGenerator: FolioGeneratorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, dto: CreateLoanDto): Promise<Loan> {
    const asset = await this.assetRepository.findById(dto.assetId);

    if (!asset || !asset.isActive) {
      throw new NotFoundException('Asset not found or is inactive');
    }

    const qty = dto.quantity || 1;

    if (asset.assetType === 'BULK') {
      if ((asset.currentQuantity || 0) < qty) {
        throw new BadRequestException(
          'Insufficient stock for this consumable asset',
        );
      }
    } else {
      if (asset.machineStatus === 'LOANED') {
        throw new BadRequestException('This asset is currently loaned out');
      }
      if (qty > 1) {
        throw new BadRequestException(
          'Cannot request more than 1 unit of a serialized asset',
        );
      }
    }

    const folio = await this.folioGenerator.generateFolio();

    const loan = await this.loanRepository.create({
      folio,
      status: 'REQUESTED',
      quantity: qty,
      estimatedReturnDate: new Date(dto.estimatedReturnDate),
      comments: dto.comments,
      requesterId: userId,
      assetId: dto.assetId,
      destinationId: dto.destinationId,
    });

    this.eventEmitter.emit('loan.status.changed', {
      loanId: loan.id,
      status: loan.status,
      folio: loan.folio,
    });

    return loan;
  }
}
