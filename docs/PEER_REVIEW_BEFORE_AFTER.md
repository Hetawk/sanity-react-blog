# Peer Review Section: Before vs After

## Before (Hardcoded)

### Issues:

- ❌ Single hardcoded peer review (Physica Scripta only)
- ❌ Had to manually update code when new reviews added
- ❌ Review data duplicated in multiple places
- ❌ Missing second peer review (Knowledge-Based Systems)
- ❌ Limited information displayed

### Code Pattern:

```javascript
// Hardcoded review data
const knownPublonsReview = {
  id: "vBHKdp8P",
  title: "Review for Physica Scripta",
  type: "Peer Review",
  completionDate: "2025",
  role: "Verified reviewer",
  organization: "Physica Scripta (journal)",
  verified: "Verified by journal integration",
  canonical: "https://publons.com/wos-op/review/author/vBHKdp8P/",
  researcherId: "LTC-7193-2024",
};

// Manually injected in multiple places
if (
  peerReviews.length === 0 ||
  !peerReviews.some((review) => review.id === "vBHKdp8P")
) {
  setPeerReviews([...peerReviews, knownPublonsReview]);
}
```

### Display:

```
Review for Physica Scripta
Physica Scripta (journal)
Verified reviewer                2025
Status: Verified by journal integration
View on Publons
```

---

## After (Dynamic ORCID Integration)

### Benefits:

- ✅ Automatically fetches ALL peer reviews from ORCID
- ✅ No manual code updates needed
- ✅ Single source of truth (ORCID API)
- ✅ Shows all reviews (Physica Scripta + Knowledge-Based Systems)
- ✅ Richer information (ISSN, verification source, etc.)
- ✅ Easily extensible for future reviews

### Code Pattern:

```javascript
// Dynamic fetching from ORCID API
const response = await fetch(
  `https://pub.orcid.org/v3.0/${orcidId}/peer-reviews`
);
const data = await response.json();

// Journal mapping (easily extensible)
const journalNames = {
  "1402-4896": "Physica Scripta",
  "0950-7051": "Knowledge-Based Systems",
};

// Parse nested structure dynamically
data.group.forEach((group) => {
  // Extract ISSN, URL, verification, etc.
  // Build review object from API data
});
```

### Display:

**Review 1:**

```
Review for Physica Scripta
Physica Scripta (journal)
ISSN: 1402-4896
Reviewer                         2025
Status: Verified by journal integration
View on Publons
```

**Review 2:**

```
Review for Knowledge-Based Systems
Knowledge-Based Systems (journal)
ISSN: 0950-7051
Reviewer                         2025
Status: Verified by Elsevier Editorial
View Review
```

---

## Technical Improvements

### 1. Data Flow

**Before:**

```
Hardcoded JS Object → Component State → Render
```

**After:**

```
ORCID API → Parse Response → Extract Data → Component State → Render
```

### 2. Maintainability

**Before:**

- Need to edit code for each new review
- Multiple locations to update
- Risk of inconsistencies

**After:**

- Automatic updates from ORCID
- Single fetch function
- Consistent data structure

### 3. Scalability

**Before:**

- Hard limit of 1 review
- Complex logic to avoid duplicates

**After:**

- Unlimited reviews supported
- Clean iteration over API results

### 4. Information Richness

**Before:**

- Title, organization, role, year, verification, link

**After:**

- Title, organization, ISSN, role, year, verification source, review URL
- Better verification status formatting
- More context for each review

---

## API Integration Details

### ORCID Peer Review API Structure

```json
{
  "group": [
    {
      "external-ids": {
        "external-id": [
          {
            "external-id-type": "peer-review",
            "external-id-value": "issn:1402-4896"
          }
        ]
      },
      "peer-review-group": [
        {
          "peer-review-summary": [
            {
              "reviewer-role": "reviewer",
              "completion-date": { "year": { "value": "2025" } },
              "review-url": { "value": "https://..." },
              "convening-organization": { "name": "..." },
              "source": { "source-name": { "value": "..." } }
            }
          ]
        }
      ]
    }
  ]
}
```

### Data Extraction Process

1. **Group Level**: Extract ISSN from external-ids
2. **Peer Review Group**: Iterate through review groups
3. **Peer Review Summary**: Extract detailed review information
4. **Journal Mapping**: Match ISSN to journal name
5. **Format Output**: Create consistent review object

---

## User Experience Improvements

### Before:

- Only saw 1 peer review
- Limited context about verification
- Static information

### After:

- See ALL peer reviews (currently 2)
- Clear verification source displayed
- ISSN provides academic reference
- Styled status boxes with brand colors
- Dynamic link text based on platform
- Automatic updates when new reviews added to ORCID

---

## Code Quality Metrics

### Lines of Code

- **Before**: ~50 lines of hardcoded data + injection logic
- **After**: ~110 lines of clean parsing logic (more comprehensive, handles all cases)

### Complexity

- **Before**: O(1) - single hardcoded review
- **After**: O(n) - scales with number of reviews

### Maintainability Score

- **Before**: ⭐⭐ (requires code changes for updates)
- **After**: ⭐⭐⭐⭐⭐ (fully automated)

### Extensibility

- **Before**: Need to modify 3+ locations in code
- **After**: Add 1 line to journal mapping object

---

## Future-Proofing

When new peer reviews are added to ORCID:

### Before:

1. Get review details
2. Open `OrcidWorks.jsx`
3. Find hardcoded review object
4. Copy and modify
5. Update `renderReviewsTab()` function
6. Test manually
7. Deploy

### After:

1. Review automatically appears ✨
2. (Optional) Add journal name to mapping if not already present

---

## Visual Styling Enhancements

### New CSS Classes

```scss
.review-issn {
  color: var(--gray-color);
  font-size: 0.9rem;
  font-style: italic;
}

.review-status {
  background-color: rgba(255, 76, 41, 0.1);
  padding: 0.5rem;
  border-radius: 5px;
  border-left: 3px solid var(--secondary-color);
}
```

### Brand Consistency

- Uses brand colors (#FF4C29)
- Consistent with rest of portfolio design
- Glassmorphism-compatible styling
- Responsive across all devices

---

## Summary

The enhancement transforms the peer review section from a static, hardcoded display into a dynamic, ORCID-integrated system that:

- ✅ Automatically stays up-to-date
- ✅ Displays all reviews with rich information
- ✅ Requires minimal maintenance
- ✅ Provides better user experience
- ✅ Follows professional academic standards (showing ISSN)
- ✅ Scales effortlessly with future reviews
