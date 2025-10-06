# ORCID Peer Review Enhancement Summary

## Overview

Enhanced the Publications section to dynamically load peer review data from ORCID API instead of hardcoding review information.

## Changes Made

### 1. **Enhanced `fetchPeerReviews()` Function** (`OrcidWorks.jsx`)

- **Removed**: All hardcoded peer review data
- **Added**: Dynamic parsing of ORCID peer review API response
- **Features**:
  - Extracts journal information from ISSN mappings
  - Properly navigates nested ORCID API structure (group → peer-review-group → peer-review-summary)
  - Captures review URLs from external IDs
  - Identifies verification source (Web of Science, Elsevier, etc.)
  - Handles multiple peer reviews dynamically
  - Improved error handling with meaningful messages

### 2. **ISSN to Journal Name Mapping**

Added a mapping table for known journals:

```javascript
const journalNames = {
  "1402-4896": "Physica Scripta",
  "0950-7051": "Knowledge-Based Systems",
};
```

- Easily extensible for future journals
- Falls back to organization name if journal not in mapping

### 3. **Enhanced Review Data Structure**

Each peer review now includes:

- `id`: Put-code from ORCID (unique identifier)
- `title`: Dynamic journal name (e.g., "Review for Physica Scripta")
- `type`: "Peer Review"
- `completionDate`: Year from ORCID data
- `role`: Reviewer role (capitalized)
- `organization`: Journal name + "(journal)" or organization
- `verified`: Verification status from source
- `reviewUrl`: Direct link to review (Publons, etc.)
- `issn`: Journal ISSN for reference

### 4. **Updated `renderReviewsTab()` Function**

- **Removed**: Hardcoded Physica Scripta review injection
- **Simplified**: Now directly uses fetched peer review data
- **Enhanced Display**:
  - Shows ISSN when available
  - Displays verification status with better styling
  - Dynamic link text (Publons vs generic "View Review")

### 5. **Removed Deprecated Code**

- Deleted `fetchPublonsReviews()` fallback function (no longer needed)
- Removed all hardcoded review objects

### 6. **Enhanced Styling** (`OrcidWorks.scss`)

Added new styles for peer review display:

```scss
.review-issn {
  color: var(--gray-color);
  font-size: 0.9rem;
  margin: 0.5rem 0;
  font-style: italic;
}

.review-status {
  background-color: rgba(255, 76, 41, 0.1);
  padding: 0.5rem;
  border-radius: 5px;
  margin-top: 0.5rem;
  border-left: 3px solid var(--secondary-color);
}
```

## Current Peer Reviews Detected

The system now automatically detects and displays:

1. **Physica Scripta**

   - ISSN: 1402-4896
   - Source: Web of Science Researcher Profile Sync
   - Status: Verified by journal integration
   - Year: 2025
   - URL: https://publons.com/wos-op/review/author/vBHKdp8P/

2. **Knowledge-Based Systems**
   - ISSN: 0950-7051
   - Source: Elsevier Editorial System
   - Status: Verified by Elsevier Editorial
   - Year: 2025

## Benefits

1. **Dynamic Updates**: New peer reviews added to ORCID automatically appear
2. **No Maintenance**: No need to manually update hardcoded values
3. **Scalable**: Easily handles multiple reviews
4. **Accurate**: Data comes directly from ORCID source of truth
5. **Professional**: Better presentation with ISSN and verification status
6. **Flexible**: Easy to extend journal mapping for future reviews

## API Integration

### ORCID Peer Review API Endpoint

```
GET https://pub.orcid.org/v3.0/{orcid-id}/peer-reviews
```

### Response Structure Handled

```
group[] → peer-review-group[] → peer-review-summary[]
```

### Data Extraction Points

- Journal ISSN: `group.external-ids.external-id[].external-id-value`
- Review URL: `peer-review-summary.external-ids.external-id[].external-id-url.value`
- Completion Year: `peer-review-summary.completion-date.year.value`
- Reviewer Role: `peer-review-summary.reviewer-role`
- Organization: `peer-review-summary.convening-organization.name`
- Verification Source: `peer-review-summary.source.source-name.value`

## Future Enhancements

To add new journals to the mapping, simply update the `journalNames` object:

```javascript
const journalNames = {
  "1402-4896": "Physica Scripta",
  "0950-7051": "Knowledge-Based Systems",
  // Add new journals here
  "1234-5678": "New Journal Name",
};
```

## Testing

To verify the changes:

1. Navigate to the Publications section
2. Click on "Peer Reviews" tab
3. Verify both reviews are displayed with correct information
4. Check that ISSN and verification status are shown
5. Test review links (should open in new tab)

## Notes

- All peer review data now comes from ORCID API
- No hardcoded values remain in the codebase
- System gracefully handles API errors
- Responsive design maintained across all devices
