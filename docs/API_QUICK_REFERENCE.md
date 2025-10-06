# API Routes Quick Reference

Quick reference for all enhanced API endpoints.

---

## 🔗 Base URL

```
http://localhost:5001/api
```

---

## 📋 Common Query Parameters

All `GET /` endpoints support:

```
?featured=true              # Only featured items
?category=<value>           # Filter by category
?includeUnpublished=true    # Include unpublished (admin)
?includeDrafts=true         # Include drafts (admin)
?sortBy=<field>             # Sort field
?sortOrder=asc|desc         # Sort direction
?featuredFirst=true         # Featured items first (default)
?limit=10                   # Limit results
?skip=0                     # Skip results (pagination)
```

---

## 🎯 Works (`/api/works`)

```http
GET    /api/works                        # List all works
GET    /api/works/:id                    # Get single work
POST   /api/works                        # Create work
PUT    /api/works/:id                    # Update work
DELETE /api/works/:id                    # Archive work
POST   /api/works/:id/restore            # Restore work
POST   /api/works/:id/toggle-featured    # Toggle featured
POST   /api/works/:id/toggle-published   # Toggle published
POST   /api/works/:id/like               # Increment likes
POST   /api/works/reorder                # Update display order
GET    /api/works/stats/overview         # Statistics
```

**Filters:** `category=Research|Professional|Personal`

---

## 👤 About (`/api/abouts`)

```http
GET    /api/abouts                       # List all sections
GET    /api/abouts/:id                   # Get single section
POST   /api/abouts                       # Create section
PUT    /api/abouts/:id                   # Update section
DELETE /api/abouts/:id                   # Archive section
POST   /api/abouts/:id/restore           # Restore section
POST   /api/abouts/:id/toggle-featured   # Toggle featured
POST   /api/abouts/:id/toggle-published  # Toggle published
POST   /api/abouts/reorder               # Update display order
```

**Filters:** `sectionType=research|leadership|teaching|innovation`

---

## ⚡ Skills (`/api/skills`)

```http
GET    /api/skills                       # List all skills
GET    /api/skills/:id                   # Get single skill
POST   /api/skills                       # Create skill
PUT    /api/skills/:id                   # Update skill
DELETE /api/skills/:id                   # Archive skill
POST   /api/skills/:id/restore           # Restore skill
POST   /api/skills/:id/toggle-featured   # Toggle featured
POST   /api/skills/:id/toggle-published  # Toggle published
POST   /api/skills/:id/endorse           # Increment endorsements
POST   /api/skills/reorder               # Update display order
GET    /api/skills/stats/by-category     # Stats by category
```

**Filters:** `category=Programming|Framework|Database|Cloud|Tool`

---

## 📚 Research (`/api/research`) - UNIFIED

### Research Statements

```http
GET    /api/research/                         # List statements
GET    /api/research/:id                      # Get statement
POST   /api/research/                         # Create statement
PUT    /api/research/:id                      # Update statement
DELETE /api/research/:id                      # Archive statement
POST   /api/research/:id/restore              # Restore statement
POST   /api/research/:id/toggle-featured      # Toggle featured
POST   /api/research/:id/toggle-published     # Toggle published
POST   /api/research/upload-pdf               # Upload PDF
POST   /api/research/statement/:id/download   # Track download
```

### Publications

```http
GET    /api/research/publications                    # List publications
GET    /api/research/publications/:id                # Get publication
POST   /api/research/publications                    # Create publication
PUT    /api/research/publications/:id                # Update publication
DELETE /api/research/publications/:id                # Archive publication
POST   /api/research/publications/:id/restore        # Restore publication
POST   /api/research/publications/:id/toggle-featured    # Toggle featured
POST   /api/research/publications/:id/toggle-published   # Toggle published
POST   /api/research/publications/upload-pdf         # Upload PDF
POST   /api/research/publications/:id/download       # Track download
PUT    /api/research/publications/:id/citations      # Update citations
POST   /api/research/publications/reorder            # Update display order
```

**Filters:** `type=Journal|Conference|Workshop|Preprint`, `year=2024`, `category=<research area>`

### Statistics & Featured

```http
GET    /api/research/stats/overview           # Combined statistics
GET    /api/research/publications/timeline    # Timeline by year
GET    /api/research/featured                 # Featured content
```

---

## 💬 Testimonials (`/api/testimonials`)

```http
GET    /api/testimonials                      # List testimonials
GET    /api/testimonials/:id                  # Get testimonial
POST   /api/testimonials                      # Create testimonial
PUT    /api/testimonials/:id                  # Update testimonial
DELETE /api/testimonials/:id                  # Archive testimonial
POST   /api/testimonials/:id/restore          # Restore testimonial
POST   /api/testimonials/:id/toggle-featured  # Toggle featured
POST   /api/testimonials/:id/toggle-published # Toggle published
POST   /api/testimonials/upload-avatar        # Upload avatar
POST   /api/testimonials/upload-logo          # Upload company logo
POST   /api/testimonials/reorder              # Update display order
GET    /api/testimonials/stats/overview       # Statistics
```

**Filters:** `category=Technical|Leadership|Research|Collaboration`, `relationship=Supervisor|Colleague|Client|Collaborator`

---

## 🎯 Leadership (`/api/leadership`)

```http
GET    /api/leadership                        # List leadership items
GET    /api/leadership/:id                    # Get leadership item
POST   /api/leadership                        # Create leadership item
PUT    /api/leadership/:id                    # Update leadership item
DELETE /api/leadership/:id                    # Archive leadership item
POST   /api/leadership/:id/restore            # Restore leadership item
POST   /api/leadership/:id/toggle-featured    # Toggle featured
POST   /api/leadership/:id/toggle-published   # Toggle published
POST   /api/leadership/upload-image           # Upload main image
POST   /api/leadership/upload-logo            # Upload organization logo
POST   /api/leadership/reorder                # Update display order
GET    /api/leadership/stats/overview         # Statistics
```

**Filters:** `category=Entrepreneurship|Community|Academic|Professional`, `isCurrent=true|false`

---

## 📅 Experience (`/api/experiences`)

```http
GET    /api/experiences                       # List experiences
GET    /api/experiences/:id                   # Get experience
POST   /api/experiences                       # Create experience
PUT    /api/experiences/:id                   # Update experience
DELETE /api/experiences/:id                   # Archive experience
POST   /api/experiences/:id/restore           # Restore experience
POST   /api/experiences/:id/toggle-featured   # Toggle featured
POST   /api/experiences/:id/toggle-published  # Toggle published
POST   /api/experiences/reorder               # Update display order
GET    /api/experiences/stats/overview        # Statistics
GET    /api/experiences/timeline              # Timeline by year
```

**Filters:** `category=professional|academic|research`, `isCurrent=true|false`, `startYear=2020`, `endYear=2024`

---

## 💼 Work Experience (`/api/work-experiences`)

```http
GET    /api/work-experiences                       # List work experiences
GET    /api/work-experiences/:id                   # Get work experience
POST   /api/work-experiences                       # Create work experience
PUT    /api/work-experiences/:id                   # Update work experience
DELETE /api/work-experiences/:id                   # Archive work experience
POST   /api/work-experiences/:id/restore           # Restore work experience
POST   /api/work-experiences/:id/toggle-featured   # Toggle featured
POST   /api/work-experiences/:id/toggle-published  # Toggle published
POST   /api/work-experiences/upload-logo           # Upload company logo
POST   /api/work-experiences/reorder               # Update display order
GET    /api/work-experiences/stats/overview        # Statistics
GET    /api/work-experiences/timeline              # Timeline chronological
```

**Filters:** `company=<name>`, `position=<title>`, `employmentType=Full-time|Contract|Internship`, `isCurrent=true|false`

---

## 🏢 Brands (`/api/brands`)

```http
GET    /api/brands                           # List brands
GET    /api/brands/:id                       # Get brand
POST   /api/brands                           # Create brand
PUT    /api/brands/:id                       # Update brand
DELETE /api/brands/:id                       # Archive brand
POST   /api/brands/:id/restore               # Restore brand
POST   /api/brands/:id/toggle-featured       # Toggle featured
POST   /api/brands/:id/toggle-published      # Toggle published
POST   /api/brands/upload-logo               # Upload logo
POST   /api/brands/reorder                   # Update display order
GET    /api/brands/stats/overview            # Statistics
```

**Filters:** `category=Partner|Client|Collaboration|Certification`, `relationship=<type>`

---

## 🏆 Awards (`/api/awards`)

```http
GET    /api/awards                           # List awards
GET    /api/awards/:id                       # Get award
POST   /api/awards                           # Create award
PUT    /api/awards/:id                       # Update award
DELETE /api/awards/:id                       # Archive award
POST   /api/awards/:id/restore               # Restore award
POST   /api/awards/:id/toggle-featured       # Toggle featured
POST   /api/awards/:id/toggle-published      # Toggle published
POST   /api/awards/upload-image              # Upload award image
POST   /api/awards/upload-logo               # Upload issuer logo
POST   /api/awards/reorder                   # Update display order
GET    /api/awards/stats/overview            # Statistics
GET    /api/awards/timeline                  # Timeline by year
```

**Filters:** `category=Academic|Professional|Research|Leadership`, `level=International|National|Regional|Institutional`, `year=2024`

---

## 📧 Contact (`/api/contacts`)

```http
GET    /api/contacts                         # List contacts (admin)
GET    /api/contacts/:id                     # Get contact
POST   /api/contacts                         # Submit contact form (public)
PUT    /api/contacts/:id                     # Update contact
DELETE /api/contacts/:id                     # Delete contact (permanent)
POST   /api/contacts/:id/mark-read           # Mark as read
POST   /api/contacts/:id/mark-unread         # Mark as unread
POST   /api/contacts/:id/reply               # Reply to contact
GET    /api/contacts/stats/overview          # Statistics
```

**Filters:** `isRead=true|false`, `isReplied=true|false`, `status=new|in-progress|resolved`, `category=job|collaboration|inquiry|feedback`, `priority=low|normal|high|urgent`

---

## 📄 Resume (`/api/resumes`)

```http
GET    /api/resumes                          # List resumes
GET    /api/resumes/:id                      # Get resume
POST   /api/resumes                          # Create resume
PUT    /api/resumes/:id                      # Update resume
PATCH  /api/resumes/:id                      # Partial update
DELETE /api/resumes/:id                      # Archive resume
POST   /api/resumes/:id/restore              # Restore resume
POST   /api/resumes/:id/toggle-featured      # Toggle featured
POST   /api/resumes/:id/toggle-published     # Toggle published
POST   /api/resumes/:id/set-active           # Set as active resume
POST   /api/resumes/:id/download             # Track download
POST   /api/resumes/upload                   # Upload resume PDF
POST   /api/resumes/reorder                  # Update display order
GET    /api/resumes/active/current           # Get active resume (public)
GET    /api/resumes/stats/overview           # Statistics
```

**Filters:** `targetType=Academic|Industry|Research|General`, `isActive=true|false`

---

## 📊 Statistics Endpoints

All statistics endpoints return JSON with counts and groupings:

```http
GET /api/works/stats/overview
GET /api/skills/stats/by-category
GET /api/research/stats/overview
GET /api/testimonials/stats/overview
GET /api/leadership/stats/overview
GET /api/experiences/stats/overview
GET /api/work-experiences/stats/overview
GET /api/brands/stats/overview
GET /api/awards/stats/overview
GET /api/contacts/stats/overview
GET /api/resumes/stats/overview
```

---

## 🎨 Response Format

All endpoints return consistent format:

### Success Response

```json
{
  "success": true,
  "data": {...} or [...],
  "count": 10,           // For list endpoints
  "message": "Success",  // For action endpoints
  "filters": {...}       // Applied filters
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🔄 Common Patterns

### Toggle Featured

```bash
curl -X POST http://localhost:5001/api/works/123/toggle-featured
```

### Batch Reorder

```bash
curl -X POST http://localhost:5001/api/works/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "uuid1", "displayOrder": 1},
      {"id": "uuid2", "displayOrder": 2}
    ]
  }'
```

### Get with Filters

```bash
curl "http://localhost:5001/api/works?featured=true&category=Research&sortBy=views&sortOrder=desc&limit=10"
```

### Increment Views

```bash
curl "http://localhost:5001/api/works/123?incrementViews=true"
```

---

## 📦 JSON Fields

Fields stored as JSON strings, automatically parsed/serialized:

| Route          | JSON Fields                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| Work           | `tags`, `techStack`, `keywords`                                                            |
| About          | `metrics`, `tags`, `competencies`, `achievements`                                          |
| Skill          | `projectsUsed`, `certifications`                                                           |
| Research       | `currentFocus`, `phdInterests`, `researchGoals`, `futureDirections`, `authors`, `keywords` |
| Experience     | `works`, `achievements`                                                                    |
| WorkExperience | `responsibilities`, `achievements`, `technologies`                                         |
| Leadership     | `impact`, `achievements`, `challenges`, `learnings`                                        |
| Resume         | `keywords`                                                                                 |

---

## 🔐 Authentication Notes

**Current:** All routes open (development)

**Production Recommendation:**

- Protect: POST, PUT, PATCH, DELETE, toggle, restore, reorder, stats, uploads
- Public: GET endpoints (published items only)
- Exception: POST /api/contacts (public contact form)

---

## 📁 File Upload Endpoints

```http
POST /api/works/upload-image
POST /api/abouts/upload-image
POST /api/skills/upload-icon
POST /api/research/upload-pdf
POST /api/research/publications/upload-pdf
POST /api/testimonials/upload-avatar
POST /api/testimonials/upload-logo
POST /api/leadership/upload-image
POST /api/leadership/upload-logo
POST /api/work-experiences/upload-logo
POST /api/brands/upload-logo
POST /api/awards/upload-image
POST /api/awards/upload-logo
POST /api/resumes/upload
```

All file uploads use `multipart/form-data` format.

---

## 🚀 Quick Test Examples

### Create a Work

```bash
curl -X POST http://localhost:5001/api/works \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "description": "Project description",
    "tags": ["React", "Node.js"],
    "category": "Professional",
    "isPublished": true,
    "isFeatured": false
  }'
```

### Get Featured Research

```bash
curl http://localhost:5001/api/research/featured
```

### Get Statistics

```bash
curl http://localhost:5001/api/works/stats/overview
```

---

**Quick Reference Version:** 1.0
**Last Updated:** December 2024
