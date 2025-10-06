# API Routes Documentation

## Overview

Complete API documentation for the enhanced portfolio backend with content management features.

---

## 📚 Research & Publications API

**Base Route:** `/api/research`

This unified route handles both research statements and publications, integrating seamlessly with ORCID data on the frontend.

### Research Statement Endpoints

#### Get All Research Statements

```http
GET /api/research/
Query Parameters:
  - featured=true          # Get only featured statements
  - includeUnpublished=true # Include unpublished (admin)
  - sortBy=displayOrder    # Sort field
  - sortOrder=asc          # Sort direction
```

#### Get Single Research Statement

```http
GET /api/research/:id
Query Parameters:
  - incrementViews=true    # Track views (for analytics)
```

#### Create Research Statement

```http
POST /api/research/
Body: {
  title: string (required)
  elevatorPitch: string
  currentFocus: array
  phdInterests: array
  longStatement: text
  researchGoals: array
  methodology: text
  futureDirections: array
  pdfUrl: string
  publications: array
  collaborations: array
  isPublished: boolean
  isFeatured: boolean
  displayOrder: number
}
```

#### Upload Research Statement PDF

```http
POST /api/research/upload-pdf
Content-Type: multipart/form-data
Body: pdf file (max 10MB)
```

#### Update Research Statement

```http
PUT /api/research/:id
Body: {same fields as create}
```

#### Toggle Featured Status

```http
POST /api/research/:id/toggle-featured
```

#### Toggle Published Status

```http
POST /api/research/:id/toggle-published
```

#### Track Download

```http
POST /api/research/statement/:id/download
```

---

### Publication Endpoints

#### Get All Publications

```http
GET /api/research/publications
Query Parameters:
  - featured=true          # Featured publications only
  - type=Journal           # Filter by type (Journal, Conference, Workshop, Preprint)
  - category=AI            # Filter by research category
  - year=2024              # Filter by year
  - sortBy=year            # Sort field (default: year)
  - sortOrder=desc         # Sort direction (default: desc)
```

**Response Example:**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "uuid",
      "title": "AI-Powered Healthcare Diagnostics",
      "abstract": "...",
      "authors": ["Enoch Dongbo", "Jane Smith"],
      "venue": "ICML 2024",
      "year": 2024,
      "type": "Conference",
      "category": "Machine Learning",
      "doi": "10.1234/example",
      "pdfUrl": "https://...",
      "citations": 15,
      "views": 234,
      "downloads": 45,
      "keywords": ["AI", "Healthcare", "Deep Learning"],
      "isFeatured": true,
      "isPublished": true
    }
  ],
  "filters": {
    "type": "Conference",
    "year": 2024
  }
}
```

#### Get Single Publication

```http
GET /api/research/publications/:id
Query Parameters:
  - incrementViews=true    # Track views
```

#### Create Publication

```http
POST /api/research/publications
Body: {
  title: string (required)
  abstract: text
  authors: array (required)
  venue: string
  year: number
  publicationDate: date
  type: string              # Journal, Conference, Workshop, Preprint
  category: string
  doi: string
  pdfUrl: string
  projectUrl: string
  arxivUrl: string
  keywords: array
  bibtex: text
  notes: text
  isPublished: boolean
  isFeatured: boolean
  displayOrder: number
}
```

#### Upload Publication PDF

```http
POST /api/research/publications/upload-pdf
Content-Type: multipart/form-data
Body: pdf file (max 10MB)
```

#### Update Publication

```http
PUT /api/research/publications/:id
Body: {same fields as create}
```

#### Update Citations Count

```http
PUT /api/research/publications/:id/citations
Body: {
  citations: number
}
```

#### Toggle Featured Status

```http
POST /api/research/publications/:id/toggle-featured
```

#### Toggle Published Status

```http
POST /api/research/publications/:id/toggle-published
```

#### Track Download

```http
POST /api/research/publications/:id/download
```

#### Reorder Publications

```http
POST /api/research/publications/reorder
Body: {
  items: [
    {id: "uuid1", displayOrder: 1},
    {id: "uuid2", displayOrder: 2}
  ]
}
```

---

### Comprehensive Research Statistics

#### Get Overview Stats

```http
GET /api/research/stats/overview
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "researchStatement": {
      "total": 1,
      "published": 1,
      "totalViews": 1250,
      "totalDownloads": 85
    },
    "publications": {
      "total": 15,
      "published": 15,
      "featured": 5,
      "totalCitations": 243,
      "totalDownloads": 1200,
      "totalViews": 5600,
      "byType": {
        "Journal": 8,
        "Conference": 6,
        "Workshop": 1
      },
      "byYear": {
        "2024": 5,
        "2023": 7,
        "2022": 3
      }
    },
    "overall": {
      "totalResearchOutputs": 15,
      "totalCitations": 243,
      "hIndex": 0,
      "totalEngagement": 6850
    }
  }
}
```

#### Get Publications Timeline

```http
GET /api/research/publications/timeline
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "2024": [
      {
        "id": "uuid",
        "title": "Paper Title",
        "year": 2024,
        "type": "Conference",
        "venue": "ICML 2024",
        "citations": 15,
        "isFeatured": true
      }
    ],
    "2023": [...]
  }
}
```

#### Get Featured Research

```http
GET /api/research/featured
```

Combines featured research statement with top 5 featured publications.

**Response Example:**

```json
{
  "success": true,
  "data": {
    "statement": {
      "id": "uuid",
      "title": "AI for Social Good",
      "elevatorPitch": "...",
      "currentFocus": ["ML", "Healthcare"],
      "phdInterests": ["..."]
    },
    "publications": [
      // Top 5 featured publications
    ]
  }
}
```

---

## 💼 Works API

**Base Route:** `/api/works`

### Advanced Filtering

```http
GET /api/works
Query Parameters:
  - featured=true              # Featured projects only
  - category=Research          # Research, Professional, Personal
  - includeUnpublished=true    # Include unpublished (admin)
  - sortBy=displayOrder        # displayOrder, createdAt, views, title
  - sortOrder=asc              # asc or desc
  - limit=10                   # Limit results
  - skip=0                     # Skip results (pagination)
```

### New Endpoints

```http
POST /api/works                      # Create work
PUT /api/works/:id                   # Update work
DELETE /api/works/:id                # Soft delete
POST /api/works/:id/restore          # Restore deleted
POST /api/works/:id/toggle-featured  # Toggle featured
POST /api/works/:id/toggle-published # Toggle published
POST /api/works/:id/like             # Increment likes
POST /api/works/reorder              # Update display order
GET /api/works/stats/overview        # Get statistics
```

### Work Data Structure

```json
{
  "id": "uuid",
  "title": "Project Title",
  "description": "...",
  "projectLink": "https://...",
  "codeLink": "https://github.com/...",
  "imgUrl": "https://...",
  "tags": ["React", "Node.js"],
  "techStack": ["React", "Express", "MySQL"],
  "category": "Research",
  "impact": "Reduced costs by 40%",
  "duration": "6 months",
  "role": "Lead Developer",
  "slug": "project-slug",
  "metaTitle": "SEO Title",
  "metaDesc": "SEO Description",
  "keywords": ["keyword1", "keyword2"],
  "views": 1234,
  "likes": 56,
  "isPublished": true,
  "isDraft": false,
  "isFeatured": true,
  "displayOrder": 1,
  "publishedAt": "2024-01-01",
  "featuredAt": "2024-01-15"
}
```

---

## 👤 About API

**Base Route:** `/api/abouts`

### Advanced Filtering

```http
GET /api/abouts
Query Parameters:
  - featured=true              # Featured sections only
  - sectionType=research       # research, leadership, teaching, innovation
  - includeUnpublished=true    # Include unpublished (admin)
  - sortBy=displayOrder        # Sort field
```

### About Data Structure

```json
{
  "id": "uuid",
  "title": "Research Excellence",
  "description": "...",
  "imgUrl": "https://...",
  "sectionType": "research",
  "icon": "🔬",
  "metrics": {
    "publications": 15,
    "citations": 200,
    "projects": 30
  },
  "tags": ["AI", "Distributed Systems"],
  "competencies": ["ML Research", "System Design"],
  "achievements": ["15+ publications", "Best Paper Award"],
  "isPublished": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

---

## ⚡ Skills API

**Base Route:** `/api/skills`

### Advanced Filtering

```http
GET /api/skills
Query Parameters:
  - featured=true                # Featured skills only
  - category=Programming         # Programming, Framework, Database, Cloud
  - sortBy=proficiencyLevel      # Sort by proficiency (default)
  - sortOrder=desc               # Highest proficiency first
```

### Skill Data Structure

```json
{
  "id": "uuid",
  "name": "React.js",
  "icon": "https://...",
  "bgColor": "#61DAFB",
  "category": "Framework",
  "proficiencyLevel": 90,
  "yearsExperience": 5.5,
  "description": "Expert in React...",
  "projectsUsed": ["Project 1", "Project 2"],
  "certifications": ["Cert 1"],
  "lastUsed": "2024-10-01",
  "learningSource": "Professional projects",
  "endorsements": 12,
  "isPublished": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

### New Endpoints

```http
POST /api/skills/:id/endorse         # Increment endorsements
GET /api/skills/stats/by-category    # Statistics by category
```

---

## 🏆 Testimonials API

**Base Route:** `/api/testimonials`

### Testimonial Data Structure

```json
{
  "id": "uuid",
  "name": "John Doe",
  "position": "Senior Developer",
  "company": "Tech Corp",
  "relationship": "Colleague",
  "testimonial": "Full testimonial text...",
  "shortVersion": "Condensed version...",
  "context": "Worked together on Project X",
  "avatar": "https://...",
  "companyLogo": "https://...",
  "linkedinUrl": "https://linkedin.com/...",
  "verificationUrl": "https://...",
  "rating": 5,
  "category": "Technical",
  "date": "2024-01-15",
  "project": "Project X",
  "isPublished": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

### Endpoints

```http
GET /api/testimonials                        # Get all
GET /api/testimonials/:id                    # Get one
POST /api/testimonials                       # Create
PUT /api/testimonials/:id                    # Update
DELETE /api/testimonials/:id                 # Soft delete
POST /api/testimonials/:id/toggle-featured   # Toggle featured
POST /api/testimonials/:id/toggle-published  # Toggle published
POST /api/testimonials/reorder               # Update order
GET /api/testimonials/stats/overview         # Statistics
```

---

## 🎯 Leadership API

**Base Route:** `/api/leadership`

### Leadership Data Structure

```json
{
  "id": "uuid",
  "title": "Founding EKD Digital",
  "organization": "EKD Digital",
  "role": "Founder & CEO",
  "category": "Entrepreneurship",
  "description": "Founded and led...",
  "startDate": "2020-01-01",
  "endDate": null,
  "isCurrent": true,
  "duration": "5+ years",
  "teamSize": 5,
  "impact": {
    "revenue": "$500K+",
    "clients": "30+",
    "teamGrowth": "0 to 5 people"
  },
  "achievements": ["Built from scratch", "100% satisfaction"],
  "challenges": ["Bootstrap funding", "Remote team"],
  "learnings": ["Client relationships", "Strategic delegation"],
  "story": "Full leadership story...",
  "imgUrl": "https://...",
  "logoUrl": "https://...",
  "websiteUrl": "https://ekddigital.com",
  "isPublished": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

### Endpoints

```http
GET /api/leadership                        # Get all
GET /api/leadership/:id                    # Get one
POST /api/leadership                       # Create
PUT /api/leadership/:id                    # Update
DELETE /api/leadership/:id                 # Soft delete
POST /api/leadership/:id/toggle-featured   # Toggle featured
POST /api/leadership/:id/toggle-published  # Toggle published
POST /api/leadership/reorder               # Update order
GET /api/leadership/stats/overview         # Statistics
```

---

## 🔄 Common Patterns

### Query Parameters (All Routes)

```
featured=true              # Get only featured items
includeUnpublished=true    # Include unpublished (admin only)
includeDrafts=true         # Include drafts (admin only)
category=<value>           # Filter by category
sortBy=<field>             # Sort by field
sortOrder=asc|desc         # Sort direction
featuredFirst=true         # Show featured first (default)
limit=<number>             # Limit results
skip=<number>              # Skip results (pagination)
```

### Content Management Actions (All Routes)

```http
POST /:id/toggle-featured   # Toggle featured status
POST /:id/toggle-published  # Toggle published status
DELETE /:id                 # Soft delete (archive)
POST /:id/restore           # Restore archived item
POST /reorder               # Update display order
```

### Soft Delete Pattern

All models support soft delete:

- `DELETE /:id` sets `deletedAt` timestamp
- Item remains in database but excluded from queries
- `POST /:id/restore` removes `deletedAt` to restore

### JSON Fields

Arrays and objects are stored as JSON strings in the database:

- Automatically parsed on GET requests
- Automatically serialized on POST/PUT requests
- Examples: `tags`, `techStack`, `metrics`, `achievements`, `authors`, `keywords`

---

## 📊 Statistics Endpoints

Each main route has a `/stats/overview` endpoint:

```http
GET /api/works/stats/overview
GET /api/skills/stats/by-category
GET /api/testimonials/stats/overview
GET /api/leadership/stats/overview
GET /api/research/stats/overview
```

Returns counts, aggregations, and groupings for analytics dashboards.

---

## 🔐 Authentication

Currently, routes are open. For production:

1. Add authentication middleware
2. Protect admin endpoints (toggle, delete, create, update)
3. Keep GET endpoints public for portfolio viewing

**Recommendation:**

```javascript
// Protect admin routes
router.post('/', authMiddleware, ...);
router.put('/:id', authMiddleware, ...);
router.delete('/:id', authMiddleware, ...);

// Keep public for viewing
router.get('/', ...);
router.get('/:id', ...);
```

---

## 🚀 Integration with ORCID

The frontend currently fetches publications from ORCID:

```javascript
// src/container/OrcidWorks/OrcidWorks.jsx
const orcidId = "0009-0005-5213-9834";
fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`);
```

**Recommended Integration:**

1. Fetch ORCID publications on frontend
2. Display manual publications from `/api/research/publications`
3. Combine and deduplicate based on DOI
4. Show unified research section

**Example Frontend Logic:**

```javascript
const [orcidPubs, setOrcidPubs] = useState([]);
const [manualPubs, setManualPubs] = useState([]);

// Fetch both sources
Promise.all([
  fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`),
  api.research.publications.getAll(),
]).then(([orcid, manual]) => {
  // Merge and deduplicate by DOI
  const combined = mergePubs(orcid, manual);
  setPublications(combined);
});
```

---

## 📝 Notes

1. **All routes return JSON** in the format:

   ```json
   {
     "success": true/false,
     "data": {...},
     "count": number,     // For list endpoints
     "message": string,   // For action endpoints
     "error": string      // On errors
   }
   ```

2. **Date fields** are ISO 8601 strings: `"2024-10-06T12:00:00.000Z"`

3. **UUIDs** are used for all IDs: `"550e8400-e29b-41d4-a716-446655440000"`

4. **File uploads** use multipart/form-data with dedicated `/upload-*` endpoints

5. **Soft deletes** keep data in database with `deletedAt` timestamp for recovery

6. **Display order** uses integers (lower numbers appear first): `1, 2, 3...`

---

## 🎯 Quick Start Examples

### Get All Published Works

```bash
curl "http://localhost:5001/api/works?featured=true&sortBy=displayOrder"
```

### Get Research Overview

```bash
curl "http://localhost:5001/api/research/stats/overview"
```

### Get Featured Publications

```bash
curl "http://localhost:5001/api/research/featured"
```

### Toggle Featured Status

```bash
curl -X POST "http://localhost:5001/api/works/123/toggle-featured"
```

### Update Display Order

```bash
curl -X POST "http://localhost:5001/api/works/reorder" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"id":"123","displayOrder":1}, {"id":"456","displayOrder":2}]}'
```
