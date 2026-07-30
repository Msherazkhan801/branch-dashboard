# Head Office Expense Feature - Implementation Steps

## Step 1: Update Types
- [x] Add `HeadOfficeExpenseEntry` interface to `types/index.ts`

## Step 2: Update Firestore Service
- [x] Add fetch/add/delete methods for head office expenses in `lib/firestoreService.ts`

## Step 3: Create Add Head Office Expense Modal
- [x] Create `components/modals/AddHeadOfficeExpenseModal.tsx`

## Step 4: Create Head Office Expense Table
- [x] Create `components/HeadOfficeExpenseTable.tsx`

## Step 5: Create Head Office Expense Graph
- [x] Create `components/HeadOfficeExpenseGraph.tsx`

## Step 6: Update DashboardContent
- [x] Update `components/DashboardContent.tsx` to include head office expenses

## Step 7: Build Verification
- [x] Run `npx tsc --noEmit` - No new errors from head office changes (2 pre-existing errors unrelated to this feature)
