-- CreateTable
CREATE TABLE "Valorant_User" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "rank_num" INTEGER NOT NULL,
    "rank_rr" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Valorant_User_pkey" PRIMARY KEY ("id")
);
