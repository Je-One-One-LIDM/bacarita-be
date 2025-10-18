import { INestApplication } from '@nestjs/common';
import { connectionSource } from 'src/config/database/typeorm.config';
import { DataSource } from 'typeorm';

const appDataSource: DataSource = connectionSource;

async function dropDatabase(): Promise<void> {
  try {
    await appDataSource.initialize();
    await appDataSource.dropDatabase();
    await appDataSource.destroy();
    console.log('Database dropped successfully');
  } catch (error) {
    console.error('Failed to drop database:', error);
    throw error;
  }
}

async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  const entities = dataSource.entityMetadatas;

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`);
  }

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
}

export { clearDatabase, dropDatabase };
