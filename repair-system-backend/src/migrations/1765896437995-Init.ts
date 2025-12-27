import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765896437995 implements MigrationInterface {
    name = 'Init1765896437995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "message" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "master_id" integer NOT NULL, "request_id" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "repair_requests" ("id" SERIAL NOT NULL, "number" character varying(50) NOT NULL, "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "climateTechType" character varying(100) NOT NULL, "climateTechModel" character varying(200) NOT NULL, "problemDescription" text NOT NULL, "requestStatus" character varying(50) NOT NULL DEFAULT 'Открыта', "completionDate" TIMESTAMP, "repairParts" text, "master_id" integer, "client_id" integer NOT NULL, CONSTRAINT "UQ_e87e8c4b5a9cf57f21a7f932282" UNIQUE ("number"), CONSTRAINT "PK_d9137a5b68d5fbd872dab6ea60a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "fio" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "login" character varying(50) NOT NULL, "passwordHash" text NOT NULL, "role" character varying(30) NOT NULL, CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_0015b2da6b41dade6bfa47dff81" FOREIGN KEY ("master_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_1de549e1e015a53856120e1398f" FOREIGN KEY ("request_id") REFERENCES "repair_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "repair_requests" ADD CONSTRAINT "FK_86f43f5beca259fac191a2cc8fa" FOREIGN KEY ("master_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "repair_requests" ADD CONSTRAINT "FK_82127ad0ccae946d1c2f61c6825" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "repair_requests" DROP CONSTRAINT "FK_82127ad0ccae946d1c2f61c6825"`);
        await queryRunner.query(`ALTER TABLE "repair_requests" DROP CONSTRAINT "FK_86f43f5beca259fac191a2cc8fa"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_1de549e1e015a53856120e1398f"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_0015b2da6b41dade6bfa47dff81"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "repair_requests"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
