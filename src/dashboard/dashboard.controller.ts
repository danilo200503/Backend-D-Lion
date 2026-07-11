import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { DashboardService } from './dashboard.service';
import { DashboardResumoDto } from './dto/dashboard-resumo.dto';


@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Retorna o resumo geral do sistema' })
  @ApiResponse({ status: 200, description: 'Resumo retornado com sucesso.', type: DashboardResumoDto })
  async obterResumo(): Promise<ControllerResponse<DashboardResumoDto>> {
    const resumo = await this.dashboardService.obterResumo();
    return buildResponse(resumo, 'Resumo do dashboard obtido com sucesso.');
  }
}
