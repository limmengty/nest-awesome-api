import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class UserMigration1715062599515 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'email',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'roles',
            type: 'simple-array',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'string',
            isNullable: false,
          },
          {
            name: 'createdDate',
            type: 'date',
          },
          {
            name: 'updatedDate',
            type: 'date',
          },
          {
            name: 'DeleteDateColumn',
            type: 'date',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
