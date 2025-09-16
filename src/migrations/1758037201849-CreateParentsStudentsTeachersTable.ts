import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParentsStudentsTeachersTable1758037201849
  implements MigrationInterface
{
  name = 'CreateParentsStudentsTeachersTable1758037201849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`parents\` (\`id\` varchar(255) NOT NULL, \`username\` varchar(90) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`token\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a306e301d01e1530492e35fccb\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`students\` (\`id\` varchar(255) NOT NULL, \`username\` varchar(90) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`token\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`teacher_id\` varchar(255) NULL, \`parent_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_fa8c3b4233deabc0917380ef4e\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`teachers\` (\`id\` varchar(255) NOT NULL, \`username\` varchar(90) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`token\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8ba8ec906be52d8fc27331e88c\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`students\` ADD CONSTRAINT \`FK_7ebb0e1088455cdde747e1c8eb7\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`students\` ADD CONSTRAINT \`FK_209313beb8d3f51f7ad69214d90\` FOREIGN KEY (\`parent_id\`) REFERENCES \`parents\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_209313beb8d3f51f7ad69214d90\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_7ebb0e1088455cdde747e1c8eb7\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8ba8ec906be52d8fc27331e88c\` ON \`teachers\``,
    );
    await queryRunner.query(`DROP TABLE \`teachers\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_fa8c3b4233deabc0917380ef4e\` ON \`students\``,
    );
    await queryRunner.query(`DROP TABLE \`students\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a306e301d01e1530492e35fccb\` ON \`parents\``,
    );
    await queryRunner.query(`DROP TABLE \`parents\``);
  }
}
