import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();


const ROLES_PADRAO: { nome: string; descricao: string }[] = [
  { nome: 'Administrador', descricao: 'Acesso total ao sistema' },
  { nome: 'Contador', descricao: 'Responsável técnico contábil' },
  { nome: 'Funcionário', descricao: 'Colaborador do escritório de contabilidade' },
  { nome: 'Cliente', descricao: 'Cliente do escritório de contabilidade' },
];

async function seedRoles(): Promise<void> {
  for (const role of ROLES_PADRAO) {
    await prisma.role.upsert({
      where: { nome: role.nome },
      update: { descricao: role.descricao },
      create: role,
    });
  }
}


async function seedCompany(): Promise<{ id: string }> {
  const cnpj = '00.623.904/0001-73';

  const empresa = await prisma.company.upsert({
    where: { cnpj },
    update: { name: 'D-Lion Contabilidade' },
    create: {
      name: 'D-Lion Contabilidade',
      cnpj,
    },
  });

  return empresa;
}

async function seedAdminUser(companyId: string): Promise<void> {
  const email = 'admin@dlion.com';

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return;
  }

  const senhaHash = await bcrypt.hash('Admin123@', 12);

  const adminRole = await prisma.role.findUnique({
    where: { nome: 'Administrador' },
  });

  const usuario = await prisma.user.create({
    data: {
      nome: 'Administrador',
      email,
      senhaHash,
      companyId,
      cargo: 'Administrador do Sistema',
      ativo: true,
      emailVerificado: true,
    },
  });

  if (adminRole) {
    await prisma.userRole.create({
      data: {
        userId: usuario.id,
        roleId: adminRole.id,
      },
    });
  }
}

async function main(): Promise<void> {
  await seedRoles();
  const empresa = await seedCompany();
  await seedAdminUser(empresa.id);
  
  console.log('Seed executado com sucesso.');
}

main()
  .catch((erro) => {
    
    console.error('Erro ao executar seed:', erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
