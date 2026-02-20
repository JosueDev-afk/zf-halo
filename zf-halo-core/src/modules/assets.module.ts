import { Module } from '@nestjs/common';
import { AssetController } from '../infrastructure/http/controllers/asset.controller';
import { CreateAssetUseCase } from '../application/use-cases/assets/create-asset.use-case';
import { UpdateAssetUseCase } from '../application/use-cases/assets/update-asset.use-case';
import { GetAssetsUseCase } from '../application/use-cases/assets/get-assets.use-case';
import { GetAssetByIdUseCase } from '../application/use-cases/assets/get-asset-by-id.use-case';
import { DeleteAssetUseCase } from '../application/use-cases/assets/delete-asset.use-case';
import { AssetPrismaRepository } from '../infrastructure/persistence/prisma/asset.prisma.repository';
import { ASSET_REPOSITORY } from '../domain/repositories/asset.repository.interface';
import { AuthModule } from './auth.module';

@Module({
    imports: [AuthModule],
    controllers: [AssetController],
    providers: [
        CreateAssetUseCase,
        UpdateAssetUseCase,
        GetAssetsUseCase,
        GetAssetByIdUseCase,
        DeleteAssetUseCase,
        {
            provide: ASSET_REPOSITORY,
            useClass: AssetPrismaRepository,
        },
    ],
    exports: [GetAssetsUseCase, GetAssetByIdUseCase],
})
export class AssetsModule { }
