import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLevelLevelProgressStoryTables1761319825055
  implements MigrationInterface
{
  name = 'CreateLevelLevelProgressStoryTables1761319825055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`levels\` (\`id\` int NOT NULL AUTO_INCREMENT, \`no\` int NOT NULL, \`name\` varchar(90) NOT NULL, \`isBonusLevel\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`teacher_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stories\` ADD CONSTRAINT \`FK_1e53dfd944df0c4468bfd640354\` FOREIGN KEY (\`level_id\`) REFERENCES \`levels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`levels\` ADD CONSTRAINT \`FK_5a0e1dfdb065020ee83c5fe32a9\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` ADD CONSTRAINT \`FK_4042565e705e245dca3abf59cb2\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` ADD CONSTRAINT \`FK_a4a99d4d215f4d365cff389bb52\` FOREIGN KEY (\`level_id\`) REFERENCES \`levels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` DROP FOREIGN KEY \`FK_a4a99d4d215f4d365cff389bb52\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`level_progresses\` DROP FOREIGN KEY \`FK_4042565e705e245dca3abf59cb2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`levels\` DROP FOREIGN KEY \`FK_5a0e1dfdb065020ee83c5fe32a9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stories\` DROP FOREIGN KEY \`FK_1e53dfd944df0c4468bfd640354\``,
    );
    await queryRunner.query(`DROP TABLE \`levels\``);
  }
}
