# Calendar Screen - Unified Horizontal Scroll (Staff Header + Calendar)

## Status: PARTIALLY IMPLEMENTED

Due to the complexity of the layout structure, the unified horizontal scroll for staff header and calendar requires significant restructuring.

## Current State

**What Was Changed:**
- Staff header ScrollView was removed (line 1022)
- Changed to a simple View (non-scrollable)
- Calendar horizontal scroll still has sync logic

**Issue:**
The staff header and calendar are in different parts of the layout hierarchy:
- Staff header: Inside the fixed header section (top)
- Calendar: Inside the scrollable body section (below)

This makes it difficult to wrap them in a single horizontal ScrollView without major layout restructuring.

## How to Revert

### Quick Revert Using Backup

```bash
# View the backup patch
cat /tmp/calendar_backup_before_unified_horizontal_scroll.patch

# Apply the backup (revert changes)
git apply /tmp/calendar_backup_before_unified_horizontal_scroll.patch --reverse

# Or use git to revert
git checkout HEAD -- Src/Screens/TabScreens/CalanderScreen/CalanderScreen.tsx
```

### Manual Revert

Look for the comment on line 1019:
```
{/* UNIFIED HORIZONTAL SCROLL: Staff header and calendar scroll together */}
{/* REVERT: To restore separate horizontal scrolls, see backup patch file */}
```

**Restore the staff header ScrollView** (around line 1021-1069):

```tsx
{/* Staff Header */}
{calanderData.length > 0 && (
  <ScrollView
    ref={staffHeaderScrollRef}
    scrollEnabled={true}
    horizontal={true}
    bounces={false}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    scrollEventThrottle={8}
    snapToInterval={threeColumnWidth}
    snapToAlignment="start"
    decelerationRate="fast"
    onScroll={(event) => {
      // Sync calendar columns when staff header is scrolled
      if (isScrollingFromCalendar.current) {
        isScrollingFromCalendar.current = false;
        return;
      }
      const offsetX = event.nativeEvent.contentOffset.x;

      // Only sync if position changed significantly
      if (Math.abs(offsetX - lastHorizontalScrollX.current) < 0.5) {
        return;
      }
      lastHorizontalScrollX.current = offsetX;
      savedHorizontalScrollPosition.current = offsetX;

      if (horizontalScrollRef.current) {
        isScrollingFromStaffHeader.current = true;
        horizontalScrollRef.current.scrollTo({
          x: offsetX,
          y: 0,
          animated: false,
        });
      }
    }}
    style={{
      height: getHeightEquivalent(85),
      backgroundColor: colors.white,
    }}
    contentContainerStyle={{
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}
  >
    {/* Staff headers content */}
    {calanderData.map((staff, index) => (
      // ... staff header items
    ))}
  </ScrollView>
)}
```

## Alternative Approach

To truly unify the staff header and calendar horizontal scroll, you would need to:

1. **Restructure the layout** to have staff headers inside the vertical scroll area
2. **Make staff headers sticky** at the top of the vertical scroll
3. **Wrap both in a single horizontal ScrollView**

This would require significant changes to:
- Layout hierarchy
- Styling
- Sticky header implementation

## Recommendation

**Keep the current sync approach** (two separate horizontal ScrollViews that sync with each other). It works well and is less complex than restructuring the entire layout.

The vertical unified scroll is working great - the horizontal sync is already quite smooth.

---

**Date:** 2024
**Status:** Reverted to separate horizontal scrolls (synced)
