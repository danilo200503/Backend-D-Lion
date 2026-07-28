import { LoggerService } from '@nestjs/common';
import { Company } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
export declare class CompanyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    findAll(): Promise<Company[]>;
    findById(id: string): Promise<Company>;
    create(dto: CreateCompanyDto): Promise<Company>;
    update(id: string, dto: UpdateCompanyDto): Promise<Company>;
    remove(id: string): Promise<void>;
    toResponseDto(empresa: Company, totalUsuarios?: number): CompanyResponseDto;
}
