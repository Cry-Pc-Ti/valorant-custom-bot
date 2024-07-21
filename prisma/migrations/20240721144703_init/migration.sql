-- CreateTable
CREATE TABLE "Valorant_User" (
    "id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "riot_id" TEXT NOT NULL,
    "riot_id_tag" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "rank_num" INTEGER,
    "rank_rr" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Valorant_User_pkey" PRIMARY KEY ("id")
);
