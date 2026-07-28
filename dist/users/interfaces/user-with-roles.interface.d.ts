import { Company, Role, User, UserRole } from '@prisma/client';
export type UserWithRoles = User & {
    userRoles: (UserRole & {
        role: Role;
    })[];
    company: Company;
};
