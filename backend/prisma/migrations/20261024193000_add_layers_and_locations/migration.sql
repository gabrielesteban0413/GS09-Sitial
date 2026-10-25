CREATE TABLE "layers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3a9aa3',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "layers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "layerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "category" TEXT NOT NULL DEFAULT 'otro',
    "notes" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "layers_userId_idx" ON "layers"("userId");
CREATE INDEX "locations_layerId_idx" ON "locations"("layerId");

ALTER TABLE "layers"
    ADD CONSTRAINT "layers_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "locations"
    ADD CONSTRAINT "locations_layerId_fkey"
    FOREIGN KEY ("layerId") REFERENCES "layers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
