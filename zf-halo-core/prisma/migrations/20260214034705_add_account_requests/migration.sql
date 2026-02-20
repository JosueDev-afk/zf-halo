-- CreateTable
CREATE TABLE "account_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_requests_email_key" ON "account_requests"("email");

-- CreateIndex
CREATE INDEX "account_requests_status_idx" ON "account_requests"("status");

-- CreateIndex
CREATE INDEX "account_requests_email_idx" ON "account_requests"("email");
