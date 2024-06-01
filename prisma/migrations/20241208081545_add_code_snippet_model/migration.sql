-- CreateTable
CREATE TABLE "CodeSnippet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CodeSnippet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CodeSnippet" ADD CONSTRAINT "CodeSnippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
