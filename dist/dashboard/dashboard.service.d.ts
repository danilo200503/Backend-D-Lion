import { PrismaService } from '../database/prisma.service';
import { DashboardResumoDto } from './dto/dashboard-resumo.dto';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterResumo(): Promise<DashboardResumoDto>;
}
