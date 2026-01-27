Migration: add_career_and_jobapplication

This migration creates two new tables:
- Career
- JobApplication

It also adds a foreign key from `JobApplication.careerId` to `Career.id` with cascade on delete/update.

Apply with `npx prisma migrate deploy` or run locally with `npx prisma migrate dev`.
