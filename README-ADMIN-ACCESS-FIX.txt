NOIRE ADMIN / SUPER ADMIN ACCESS FIX

Changes included:
- AdminProtectedRoute now waits for AuthContext.authLoading (the actual exported state name).
- Both admin and super_admin are accepted by backend admin API middleware.
- Removed the duplicate legacy /admin route that could shadow the new protected dashboard route.
- Account page admin shortcut is visible to both admin and super_admin.
- Legacy AdminPage role checks also accept super_admin if used elsewhere.
- Added a Super Admin-only PATCH /api/admin/users/:id/role endpoint. It permits customer/admin roles only and protects super_admin accounts.

Setup:
1. Keep your own server/.env file; it is intentionally not included in this ZIP.
2. In the project root run: npm install
3. In the project root run: npm run dev
4. In another terminal run: npm run dev:api (or npm start from server).
5. Sign out, then sign in again with the configured Super Admin email.

Notes:
- Do not copy node_modules from this ZIP; it is intentionally excluded.
- Backend server.js passed `node --check`. A full Vite build could not be verified in this environment because the uploaded node_modules archive lacks the platform-specific Rolldown native binding.
