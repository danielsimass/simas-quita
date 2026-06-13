-- Simplify financing model: remove PRICE/SAC fields, flat installments, backward prepayment

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_financings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "financed_amount" DECIMAL NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "installment_amount" DECIMAL NOT NULL,
    "first_due_date" DATETIME NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_financings" ("id", "user_id", "name", "institution", "financed_amount", "installment_count", "installment_amount", "first_due_date", "notes", "created_at")
SELECT "id", "user_id", "name", "institution", "financed_amount", "installment_count", "installment_amount", "first_due_date", "notes", "created_at"
FROM "financings";

DROP TABLE "financings";
ALTER TABLE "new_financings" RENAME TO "financings";

CREATE TABLE "new_installments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "financing_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "due_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_at" DATETIME,
    CONSTRAINT "installments_financing_id_fkey" FOREIGN KEY ("financing_id") REFERENCES "financings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_installments" ("id", "financing_id", "number", "amount", "due_date", "status", "paid_at")
SELECT "id", "financing_id", "number", "amount", "due_date", "status", "paid_at"
FROM "installments";

DROP TABLE "installments";
ALTER TABLE "new_installments" RENAME TO "installments";
CREATE UNIQUE INDEX "installments_financing_id_number_key" ON "installments"("financing_id", "number");

CREATE TABLE "new_prepayments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "financing_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "discount" DECIMAL NOT NULL,
    "paid_installment_numbers" TEXT NOT NULL,
    "remaining_balance_after" DECIMAL NOT NULL,
    CONSTRAINT "prepayments_financing_id_fkey" FOREIGN KEY ("financing_id") REFERENCES "financings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE "prepayments";
ALTER TABLE "new_prepayments" RENAME TO "prepayments";

PRAGMA foreign_keys=ON;
