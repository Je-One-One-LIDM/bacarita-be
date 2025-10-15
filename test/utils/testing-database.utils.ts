import { connectionSource } from 'src/config/database/typeorm.config';
import { DataSource } from 'typeorm';

const appDataSource: DataSource = connectionSource;

async function dropDatabase(): Promise<void> {
  await appDataSource.initialize();
  await appDataSource.dropDatabase();
  await appDataSource.destroy();
}

export { dropDatabase };
