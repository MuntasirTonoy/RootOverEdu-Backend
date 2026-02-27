# Root Over Education Backend

**Version 2A.26**

This is the Express.js / MongoDB backend for the Root Over Education e-learning platform.

## What's New in Version 2A.26

- Added `isBanned` functionality to `User` schema and admin routes.
- Modified `authMiddleware` to permanently block access to banned users via 403 status code.
- Fixed case-sensitive logic in `getAllUsers` regex. Now securely supports case-insensitive search mappings.
- Added `isPublished` Boolean to the `Course` schema.
- Updated user course-fetching to dynamically omit completely drafts unless uniquely authorized.

## Features

- RESTful API for Movies/Subjects/Courses
- Admin and User roles
- Firebase Authentication Middleware

## Deployment

- **Backend URL**: [https://root-over-edu-backend.vercel.app](https://root-over-edu-backend.vercel.app)
- **Frontend URL**: [https://rootovereducation.vercel.app](https://rootovereducation.vercel.app)

## Setup

1. `npm install`
2. Create `.env` with:
   - `MONGO_URI`
   - `PORT`
3. `npm run dev`
