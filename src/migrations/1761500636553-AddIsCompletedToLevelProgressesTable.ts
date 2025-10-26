import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCompletedToLevelProgressesTable1761500636553
  implements MigrationInterface
{
  name = 'AddIsCompletedToLevelProgressesTable1761500636553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` ADD \`isCompleted\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` DROP COLUMN \`isCompleted\``,
    );
  }
}
