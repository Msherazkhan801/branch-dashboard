# TODO

## Task: Admin user/manager management with Firestore-backed auth

- [x] Add Firestore `users` collection functions to `lib/firestoreService.ts`
- [x] Update `lib/auth.ts` to authenticate against Firestore users
- [x] Update `lib/constants.ts` to add admin-only "Users" nav item
- [x] Update `components/Sidebar.tsx` to show "Users" link only for admin
- [x] Add `"manager"` role to `UserRole` type + permissions in `lib/auth.ts`
- [x] Add `updateUserInDB` to `lib/firestoreService.ts` + include `"manager"` in role type
- [x] Create `components/modals/AddUserModal.tsx` for creating users/managers
- [x] Create `app/users/page.tsx` admin-only user management page
- [x] Fix login page demo credential text
- [x] Run lint + typecheck (passes with no errors)
