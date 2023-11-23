-- CreateTable
CREATE TABLE "StkRes" (
    "id" SERIAL NOT NULL,
    "merchantRequestID" TEXT NOT NULL,
    "checkoutRequestID" TEXT NOT NULL,
    "responseDescription" TEXT NOT NULL,
    "customerMessage" TEXT NOT NULL,

    CONSTRAINT "StkRes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallbackRes" (
    "id" SERIAL NOT NULL,
    "checkoutRequestID" TEXT NOT NULL,
    "resultCode" INTEGER NOT NULL,
    "resultDesc" TEXT NOT NULL,
    "mpesaReceiptNumber" TEXT,
    "amount" INTEGER,
    "phoneNumber" TEXT,
    "transactionDate" TEXT,

    CONSTRAINT "CallbackRes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StkRes_checkoutRequestID_key" ON "StkRes"("checkoutRequestID");

-- CreateIndex
CREATE UNIQUE INDEX "CallbackRes_checkoutRequestID_key" ON "CallbackRes"("checkoutRequestID");

-- AddForeignKey
ALTER TABLE "CallbackRes" ADD CONSTRAINT "CallbackRes_checkoutRequestID_fkey" FOREIGN KEY ("checkoutRequestID") REFERENCES "StkRes"("checkoutRequestID") ON DELETE RESTRICT ON UPDATE CASCADE;
