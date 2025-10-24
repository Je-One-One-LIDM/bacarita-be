import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProgressFromLevelProgressTable1761324572718
  implements MigrationInterface
{
  name = 'DropProgressFromLevelProgressTable1761324572718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` DROP COLUMN \`progress\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` ADD \`progress\` int NOT NULL DEFAULT '0'`,
    );
  }
}
