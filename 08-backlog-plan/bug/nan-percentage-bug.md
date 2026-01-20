# Bug: NaN% Display Issue

**Priority:** P1
**Status:** To Investigate
**Reported:** 2026-01-20
**Component:** Unknown (need more details)

## Issue Description

User reported "Tỷ lệ quan trọng NaN%" appearing in the interface.

## Location

Need to investigate where this is appearing. Possible locations:
1. Dashboard statistics cards
2. Unit Dashboard (already fixed in commit b259832)
3. System list tables
4. Other percentage displays

## Previous Fix

Fixed NaN% on Unit Dashboard by changing color token objects to `.main` strings:
- Commit: b259832 (2026-01-20)
- Fixed gradients and Progress bar strokeColor

## Next Steps

1. Get screenshot or specific page location from user
2. Investigate root cause
3. Apply similar fix (likely color token issue)
4. Test all percentage displays

## Notes

This might be a different instance of the same color token issue, or a calculation problem where division by zero occurs.
