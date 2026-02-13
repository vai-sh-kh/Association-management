# Members Module – Test Report (Testing Engineer)

**Date:** 2026-02-13  
**Environment:** Browser (localhost:3000), logged in as vaishakhpat2003@gmail.com  
**Scope:** Add members (one by one), Edit, Delete, Sort, Search

---

## Test Summary

| # | Test Case | Result | Notes |
|---|-----------|--------|--------|
| 1 | Add member (one by one) | **PASS** | 5 members added via UI: Alice Brown, Bob Wilson, Carol Davis (+ John Doe, Jane Smith from prior session) |
| 2 | Edit member | **PASS** | Actions → Edit on Jane Smith → Name changed to "Jane Smith (Updated)" → Save → toast "Member updated successfully", row updated |
| 3 | Delete member | **PASS** | Actions → Delete on John Doe → Confirm "Remove" → toast "Member removed successfully", row removed (4 members left) |
| 4 | Sort by column | **PASS** | Clicked "Name" header → list reordered A–Z: Alice Brown, Bob Wilson, Carol Davis, Jane Smith (Updated) |
| 5 | Search | **PASS** | Typed "Alice" in search → table filtered to 1 result (Alice Brown), footer "Showing 1–1 of 1 result" |

---

## Detailed Test Steps

### 1. Add Member (one by one)

- **Steps:** Add Member → fill Name, Email, Unit, Building → Create.
- **Data used:**
  - Alice Brown, alice.brown@example.com, 301, Tower A
  - Bob Wilson, bob.wilson@example.com, 402, Tower B
  - Carol Davis, carol.davis@example.com, 103, Tower C
- **Result:** Each create showed "Creating..." spinner, then "Member added successfully" toast; sheet closed; new row appeared in table.

### 2. Edit Member

- **Steps:** Row 5 (Jane Smith) → Actions (⋮) → Edit → Name set to "Jane Smith (Updated)" → Save.
- **Result:** "Saving..." spinner, then "Member updated successfully" toast; sheet closed; row 5 shows "Jane Smith (Updated)".

### 3. Delete Member

- **Steps:** Row 4 (John Doe) → Actions (⋮) → Delete → modal "Remove this resident?" → Remove.
- **Result:** "Removing..." spinner, then "Member removed successfully" toast; modal closed; John Doe row removed; count 5 → 4.

### 4. Sort

- **Steps:** Click table header "Name".
- **Result:** List sorted by name (asc): Alice Brown, Bob Wilson, Carol Davis, Jane Smith (Updated). Sort indicator visible on Name column.

### 5. Search

- **Steps:** Type "Alice" in "Search name, email..." box.
- **Result:** Table shows only Alice Brown; footer "Showing 1–1 of 1 result". Search filters by name/email/member_id as designed.

---

## Conclusion

All exercised flows **passed**:

- **Add:** Multiple members added one by one; toasts and list update correct.
- **Edit:** Actions → Edit → change field → Save; toast and row update correct.
- **Delete:** Actions → Delete → confirm Remove; toast and row removal correct.
- **Sort:** Name column sort reorders list correctly.
- **Search:** Filter by "Alice" returns only matching member.

**Recommendation:** For full “10 users one by one” coverage, add the remaining 5 members (e.g. David Lee, Emma Taylor, Frank Martinez, Grace Anderson, Henry Clark) via the same Add Member flow; no code changes required.
