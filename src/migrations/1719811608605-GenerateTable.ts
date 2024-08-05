import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateTable1719811608605 implements MigrationInterface {
  name = 'GenerateTable1719811608605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "integration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "integrationId" text NOT NULL, "provider" "integration_provider_enum" NOT NULL, "byUserId" uuid, CONSTRAINT "UQ_a08ea9d17554eac051c143b1c7e" UNIQUE ("integrationId"), CONSTRAINT "PK_f348d4694945d9dc4c7049a178a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b86e44f6c7d1148a7f894d2f7" ON "integration" ("byUserId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "message" character varying NOT NULL, "username" character varying NOT NULL, "byUserId" uuid, CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_622b4d64e117e5e8130d85b0e3" ON "chats" ("byUserId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "price" money NOT NULL, CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "discounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "price" money NOT NULL, "onPurchaseId" uuid, CONSTRAINT "REL_7bd5c184b6ddbed648b0848a3f" UNIQUE ("onPurchaseId"), CONSTRAINT "PK_66c522004212dc814d6e2f14ecc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "username" character varying(255) NOT NULL, "firstname" character varying(255) NOT NULL, "lastname" character varying(255), "email" text NOT NULL, "roles" text NOT NULL DEFAULT 'DEFAULT', "password" character varying(255) NOT NULL, "registrationType" "users_registrationtype_enum" NOT NULL DEFAULT 'PASSWORD', "picture" text, "refreshToken" character varying, "byUserId" uuid, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_9080d0eae01d631513fb1aab89" UNIQUE ("byUserId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "dateOfPublished" character varying NOT NULL, "category" character varying, "byUserId" uuid, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "purchases_books_books" ("purchasesId" uuid NOT NULL, "booksId" uuid NOT NULL, CONSTRAINT "PK_f3d5e4856774d0746653a2ff33a" PRIMARY KEY ("purchasesId", "booksId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3006b96f828ec106e4792085a" ON "purchases_books_books" ("purchasesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd78fd35b910005a63d75339a6" ON "purchases_books_books" ("booksId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD CONSTRAINT "FK_3b86e44f6c7d1148a7f894d2f78" FOREIGN KEY ("byUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_622b4d64e117e5e8130d85b0e3e" FOREIGN KEY ("byUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "discounts" ADD CONSTRAINT "FK_7bd5c184b6ddbed648b0848a3fa" FOREIGN KEY ("onPurchaseId") REFERENCES "purchases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_9080d0eae01d631513fb1aab893" FOREIGN KEY ("byUserId") REFERENCES "discounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_b60ec708b6cf0995189cfc6cc5f" FOREIGN KEY ("byUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchases_books_books" ADD CONSTRAINT "FK_f3006b96f828ec106e4792085a7" FOREIGN KEY ("purchasesId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchases_books_books" ADD CONSTRAINT "FK_bd78fd35b910005a63d75339a6e" FOREIGN KEY ("booksId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchases_books_books" DROP CONSTRAINT "FK_bd78fd35b910005a63d75339a6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchases_books_books" DROP CONSTRAINT "FK_f3006b96f828ec106e4792085a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "FK_b60ec708b6cf0995189cfc6cc5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_9080d0eae01d631513fb1aab893"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discounts" DROP CONSTRAINT "FK_7bd5c184b6ddbed648b0848a3fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_622b4d64e117e5e8130d85b0e3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" DROP CONSTRAINT "FK_3b86e44f6c7d1148a7f894d2f78"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_bd78fd35b910005a63d75339a6"`);
    await queryRunner.query(`DROP INDEX "IDX_f3006b96f828ec106e4792085a"`);
    await queryRunner.query(`DROP TABLE "purchases_books_books"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "discounts"`);
    await queryRunner.query(`DROP TABLE "purchases"`);
    await queryRunner.query(`DROP INDEX "IDX_622b4d64e117e5e8130d85b0e3"`);
    await queryRunner.query(`DROP TABLE "chats"`);
    await queryRunner.query(`DROP INDEX "IDX_3b86e44f6c7d1148a7f894d2f7"`);
    await queryRunner.query(`DROP TABLE "integration"`);
  }
}
