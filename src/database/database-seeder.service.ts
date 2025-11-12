import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LevelSeeder } from './seeders/level.seeder';

@Injectable()
export class DatabaseSeederService {
  constructor(private readonly dataSource: DataSource) {}

  async seedAll(): Promise<{ message: string; success: boolean }> {
    try {
      await new LevelSeeder(this.dataSource).run();

      return {
        success: true,
        message: 'Database seeding completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async seedLevels(): Promise<{ message: string; success: boolean }> {
    try {
      await new LevelSeeder(this.dataSource).run();

      return {
        success: true,
        message: 'Levels and stories seeded successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Level seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
