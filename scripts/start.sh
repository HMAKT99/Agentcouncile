#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy || { echo "ERROR: Migration failed"; exit 1; }

# Check if database has been seeded (check if members table has rows)
MEMBER_COUNT=$(node -e "
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
prisma.member.count().then(c => { console.log(c); prisma.\$disconnect(); }).catch(() => { console.log(0); prisma.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$MEMBER_COUNT" = "0" ]; then
  echo "Seeding database with initial data..."
  npx tsx prisma/seed.ts || { echo "WARNING: Seed failed, continuing..."; }
else
  echo "Database already seeded ($MEMBER_COUNT members)"
fi

echo "Starting server..."
exec node server.js
