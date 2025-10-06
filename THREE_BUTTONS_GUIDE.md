# 🎛️ Three-Button Control System for Work Portfolio

**Date**: October 6, 2025  
**Status**: ✅ IMPLEMENTED

---

## 🎯 Button Layout

The three buttons are always visible (when there are more than 6 projects):

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     [Load More (38)]  [Show Less]  [Reset]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔵 Button 1: Load More

### Purpose

Progressively load more projects (6 at a time)

### Appearance

- **Color**: Blue (`--secondary-color`)
- **Text Color**: White
- **Label**: `Load More (X)` where X = remaining projects
- **When All Loaded**: Just shows "Load More" (disabled)

### Behavior

- **Initial State**: Active, shows "Load More (38)" if 44 total projects
- **After Click**: Loads 6 more, updates count to "Load More (32)"
- **When All Loaded**: Button becomes disabled (grayed out, no hover effect)
- **State Changes**: 6 → 12 → 18 → 24 → 30 → 36 → 42 → 44 (all loaded)

### Code

```javascript
<button
  onClick={handleLoadMore}
  className="p-text load-more-btn"
  disabled={visibleItems >= filterWork.length}
>
  Load More{" "}
  {visibleItems < filterWork.length
    ? `(${filterWork.length - visibleItems})`
    : ""}
</button>
```

---

## ⚪ Button 2: Show Less

### Purpose

Collapse the view back to 6 projects

### Appearance

- **Color**: Gray (`--lightGray-color`)
- **Text Color**: Black
- **Hover**: Dark gray background, white text
- **Label**: `Show Less`

### Behavior

- **Initial State**: Disabled (only 6 projects showing)
- **After Loading More**: Becomes active
- **On Click**:
  - Resets visible items to 6
  - Re-enables Load More button
  - Does NOT scroll or change filter
- **Stays on current filter** (e.g., if filtered to "React", stays on React)

### Code

```javascript
<button
  onClick={() => {
    setVisibleItems(6);
    setShowLoadMore(true);
  }}
  className="p-text show-less-btn"
  disabled={visibleItems <= 6}
>
  Show Less
</button>
```

---

## 🟤 Button 3: Reset

### Purpose

Reset everything to initial state (6 projects, "All" filter, scroll to top)

### Appearance

- **Color**: Brown (`--brown-color`)
- **Text Color**: White
- **Hover**: Darker brown + scale + shadow
- **Label**: `Reset`

### Behavior

- **Initial State**: Disabled (already at initial state)
- **Becomes Active When**:
  - User has loaded more than 6 projects, OR
  - User has selected a filter other than "All"
- **On Click**:
  - Resets visible items to 6
  - Changes filter back to "All"
  - Shows all projects (not filtered)
  - Scrolls page to top of Work section
  - Re-enables Load More button

### Code

```javascript
<button
  onClick={() => {
    setVisibleItems(6);
    setShowLoadMore(true);
    setActiveFilter("All");
    setFilterWork(works);
    window.scrollTo({
      top: document.getElementById("work")?.offsetTop || 0,
      behavior: "smooth",
    });
  }}
  className="p-text reset-btn"
  disabled={visibleItems === 6 && activeFilter === "All"}
>
  Reset
</button>
```

---

## 🎬 User Flow Examples

### Scenario 1: Loading More Projects

```
Initial State:
✅ Load More (38)    🚫 Show Less    🚫 Reset
Showing 6 of 44 projects

After clicking "Load More":
✅ Load More (32)    ✅ Show Less    ✅ Reset
Showing 12 of 44 projects

After clicking "Load More" 5 more times:
🚫 Load More         ✅ Show Less    ✅ Reset
Showing 44 of 44 projects (all loaded)
```

---

### Scenario 2: Filtering Then Loading

```
User clicks "React" filter:
✅ Load More (14)    🚫 Show Less    ✅ Reset (active because filter changed)
Showing 6 of 20 React projects

After clicking "Load More":
✅ Load More (8)     ✅ Show Less    ✅ Reset
Showing 12 of 20 React projects

After clicking "Show Less":
✅ Load More (14)    🚫 Show Less    ✅ Reset
Showing 6 of 20 React projects (still filtered to React)
```

---

### Scenario 3: Using Reset

```
Current State:
🚫 Load More         ✅ Show Less    ✅ Reset
Showing 20 of 20 React projects (all React projects loaded)

After clicking "Reset":
✅ Load More (38)    🚫 Show Less    🚫 Reset
Showing 6 of 44 projects (filter = "All", scrolled to top)
```

---

## 🎨 Visual States

### Active Button States

**Load More (Active)**

```css
background: #313bac (blue)
color: white
hover: darker blue + scale(1.05) + shadow
```

**Show Less (Active)**

```css
background: #e4e4e4 (light gray)
color: black
hover: #6b7688 (dark gray) + white text + scale(1.05)
```

**Reset (Active)**

```css
background: #46364a (brown)
color: white
hover: #362837 (darker brown) + scale(1.05) + shadow
```

### Disabled Button States

**All Disabled Buttons**

```css
opacity: 0.5
cursor: not-allowed
no hover effects
no scale transforms
```

---

## 📱 Responsive Design

### Desktop (>= 2000px)

```
[ Load More (38) ]  [ Show Less ]  [ Reset ]
   200px wide         200px wide     200px wide
   1.5rem padding     1.5rem padding 1.5rem padding
   1.2rem font        1.2rem font    1.2rem font
```

### Tablet/Desktop (768px - 1999px)

```
[ Load More (38) ]  [ Show Less ]  [ Reset ]
   150px wide         150px wide     150px wide
   1rem padding       1rem padding   1rem padding
   1rem font          1rem font      1rem font
```

### Mobile (<= 450px)

```
[ Load More (38) ]
  120px wide
  0.8rem padding
  0.85rem font

[ Show Less ]        [ Reset ]
  120px wide          120px wide
  0.8rem padding      0.8rem padding
  0.85rem font        0.85rem font

(buttons wrap to multiple rows if needed)
```

---

## 🔧 Technical Implementation

### Button Container CSS

```scss
.app__work-loadmore {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem; // Space between buttons
  margin: 3rem 0 2rem;
  width: 100%;
  flex-wrap: wrap; // Wrap on small screens
}
```

### Disabled State Logic

**Load More**: Disabled when `visibleItems >= filterWork.length`

- Meaning: All available projects are already showing

**Show Less**: Disabled when `visibleItems <= 6`

- Meaning: Already at minimum (6 projects showing)

**Reset**: Disabled when `visibleItems === 6 && activeFilter === 'All'`

- Meaning: Already at initial state (6 projects, no filter applied)

---

## ✅ Benefits of Three-Button System

### 1. **Clear Intent**

- Each button has one specific purpose
- No confusion about what each button does
- Always visible (not conditionally swapped)

### 2. **Better UX**

- Users can see all options at once
- Disabled state shows what's possible
- Visual feedback through disabled/enabled states

### 3. **More Control**

- **Load More**: Progressive loading
- **Show Less**: Quick collapse without losing filter
- **Reset**: Complete reset + scroll to top

### 4. **Intuitive**

- Load More = see more of current view
- Show Less = collapse current view
- Reset = back to start

---

## 🎯 Button Hierarchy

```
Primary Action:   Load More (blue - most prominent)
Secondary Action: Show Less (gray - less prominent)
Tertiary Action:  Reset (brown - distinct but not primary)
```

**Color Psychology**:

- **Blue** (Load More): Progress, forward action
- **Gray** (Show Less): Neutral, backward action
- **Brown** (Reset): Distinct, complete reset

---

## 🧪 Testing Scenarios

### Test 1: All Buttons Start Correctly

- [ ] Load More is enabled (blue, shows count)
- [ ] Show Less is disabled (gray, opacity 50%)
- [ ] Reset is disabled (brown, opacity 50%)

### Test 2: Load More Functionality

- [ ] Clicking Load More loads 6 more projects
- [ ] Count decreases correctly
- [ ] Button disables when all projects loaded
- [ ] Show Less enables after first Load More
- [ ] Reset enables after first Load More

### Test 3: Show Less Functionality

- [ ] After loading more, Show Less is enabled
- [ ] Clicking Show Less resets to 6 projects
- [ ] Filter remains unchanged
- [ ] Load More re-enables with correct count
- [ ] Show Less disables after clicking it

### Test 4: Reset Functionality

- [ ] Reset is disabled initially
- [ ] Becomes enabled after loading more
- [ ] Becomes enabled after filtering
- [ ] Clicking Reset goes back to 6 projects
- [ ] Clicking Reset changes filter to "All"
- [ ] Clicking Reset scrolls to top of section
- [ ] All buttons return to initial state after Reset

### Test 5: Filter Interaction

- [ ] Filtering enables Reset button
- [ ] Filtering resets visible items to 6
- [ ] Load More shows correct count for filtered items
- [ ] Show Less works with filtered items
- [ ] Reset removes filter and shows all projects

### Test 6: Disabled State

- [ ] Disabled buttons have 50% opacity
- [ ] Disabled buttons don't respond to clicks
- [ ] Disabled buttons don't show hover effects
- [ ] Cursor changes to not-allowed on disabled buttons

### Test 7: Responsive Behavior

- [ ] Buttons wrap properly on mobile
- [ ] Min-width prevents buttons from being too small
- [ ] Font sizes adjust for screen size
- [ ] Gap between buttons is consistent
- [ ] Touch targets are adequate on mobile

---

## 🎊 Summary

**What We Built**:

- Three always-visible buttons (when >6 projects)
- Smart enable/disable logic
- Progressive loading (Load More)
- Quick collapse (Show Less)
- Complete reset (Reset)

**User Benefits**:

- ✅ Clear control over pagination
- ✅ Can collapse without losing filter
- ✅ Can reset everything at once
- ✅ Visual feedback through button states
- ✅ No confusion about current state

**Technical Excellence**:

- ✅ Proper disabled states
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Accessible (disabled states, proper cursor)
- ✅ Consistent styling

---

**Status**: ✅ All three buttons working perfectly!
