/* eslint-disable no-console */
import { DataSource } from 'typeorm'; // adjust to your config file
import { connectionSource } from 'src/config/database/typeorm.config';
import { LevelSeeder } from './seeders/level.seeder';

async function runSeeders(): Promise<void> {
  const dataSource: DataSource = connectionSource;

  await dataSource.initialize();
  console.log('Database connected.');

  await new LevelSeeder(dataSource).run();

  await dataSource.destroy();
  console.log('Seeding completed.');
}

runSeeders().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
