-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "konnectWalletId" TEXT,
    "konnectOrganisationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT,
    "notifyOnPayment" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnLinkOpening" BOOLEAN NOT NULL DEFAULT false,
    "notifyMarketing" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "shareCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "links_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    CONSTRAINT "contents_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "blurHash" TEXT,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "contentId" TEXT NOT NULL,
    CONSTRAINT "files_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paymentId" TEXT,
    "paymentStatus" TEXT,
    "konnectPaymentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchases_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "link_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "link_views_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_collectionId_key" ON "profiles"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "links_shareCode_key" ON "links"("shareCode");
