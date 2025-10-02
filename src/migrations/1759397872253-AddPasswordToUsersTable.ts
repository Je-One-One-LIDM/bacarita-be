import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToUsersTable1759397872253
  implements MigrationInterface
{
  name = 'AddPasswordToUsersTable1759397872253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`parents\` ADD \`password\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`students\` ADD \`password\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`teachers\` ADD \`password\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`teachers\` DROP COLUMN \`password\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`students\` DROP COLUMN \`password\``,
    );
    await queryRunner.query(`ALTER TABLE \`parents\` DROP COLUMN \`password\``);
  }
}
