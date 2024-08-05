import { MigrationInterface, QueryRunner } from 'typeorm';

export class adddoi1719825897552 implements MigrationInterface {
  name = 'adddoi1719825897552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."books" ADD "doi" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."books" DROP COLUMN "doi"`);
  }
}
