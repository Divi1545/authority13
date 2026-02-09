#!/bin/bash
# Run this script after deploying to Vercel to set up the database
npx prisma db push --accept-data-loss
npm run db:seed
