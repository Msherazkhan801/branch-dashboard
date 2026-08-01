# Class Income Return Feature - Implementation Progress

## Steps:
- [x] 1. Update `types/index.ts` - Add `returnedCustomers` and `returnedAmount` fields
- [x] 2. Update `lib/firestoreService.ts` - Add `updateClassIncomeEntry` function
- [x] 3. Create `components/modals/ReturnClassIncomeModal.tsx` - New modal for entering return details
- [x] 4. Update `components/ClasswiseTable.tsx` - Add Return button, show net income, integrate return modal
- [x] 5. Update `components/DashboardContent.tsx` - Add handler, update stats to use net income
- [x] 6. Verify build passes
- [x] 7. Fix validation - prevent returning more customers/amount than available (max limits, disable button, show alerts)
- [x] 8. Returned rows display red background with white text, show net income/customers
- [x] 9. Add "Return 1" quick action button for single-customer return with proportional refund
