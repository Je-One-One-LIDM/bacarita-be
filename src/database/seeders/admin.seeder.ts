import { Admin } from 'src/feature/users/entities/admin.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class AdminSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const adminRepo: Repository<Admin> = manager.getRepository(Admin);

      const adminsData = [
        {
          id: uuidv4(),
          email: 'admin@bacarita.com',
          username: 'admin',
          fullName: 'Admin Bacarita',
          password: 'adminbacarita123',
        },
      ];

      for (const adminData of adminsData) {
        const existingAdmin = await adminRepo.findOne({
          where: [{ email: adminData.email }, { username: adminData.username }],
        });

        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash(adminData.password, 10);
          const admin = adminRepo.create({
            ...adminData,
            password: hashedPassword,
            token: null,
          });
          await adminRepo.save(admin);
        }
      }
    });
  }
}
