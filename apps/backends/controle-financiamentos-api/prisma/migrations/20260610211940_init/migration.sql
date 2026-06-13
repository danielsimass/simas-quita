-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "financed_amount" DECIMAL NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "installment_amount" DECIMAL NOT NULL,
    "first_due_date" DATETIME NOT NULL,
    "system" TEXT NOT NULL,
    "monthly_rate" DECIMAL,
    "bank_prepayment_value" DECIMAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "financing_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "interest" DECIMAL NOT NULL,
    "amortization" DECIMAL NOT NULL,
    "balance" DECIMAL NOT NULL,
    "due_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_at" DATETIME,
    CONSTRAINT "installments_financing_id_fkey" FOREIGN KEY ("financing_id") REFERENCES "financings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prepayments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "financing_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "bank_charged_value" DECIMAL,
    "estimated_savings" DECIMAL NOT NULL,
    "real_savings" DECIMAL,
    "eliminated_installments" INTEGER NOT NULL,
    CONSTRAINT "prepayments_financing_id_fkey" FOREIGN KEY ("financing_id") REFERENCES "financings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "installments_financing_id_number_key" ON "installments"("financing_id", "number");
