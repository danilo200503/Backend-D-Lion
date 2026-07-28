import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { DashboardService } from './dashboard.service';
import { DashboardResumoDto } from './dto/dashboard-resumo.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    obterResumo(): Promise<ControllerResponse<DashboardResumoDto>>;
}
