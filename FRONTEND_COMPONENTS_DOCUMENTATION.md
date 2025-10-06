# Frontend Components Documentation

## Overview

This document provides comprehensive documentation for all reusable React components in the portfolio application. These components follow the DRY (Don't Repeat Yourself) principle and are designed for maximum reusability across the application.

## Table of Contents

1. [API Client](#api-client)
2. [Card Component](#card-component)
3. [Grid Component](#grid-component)
4. [FilterBar Component](#filterbar-component)
5. [Loading Component](#loading-component)
6. [EmptyState Component](#emptystate-component)
7. [ErrorBoundary Component](#errorboundary-component)
8. [Timeline Component](#timeline-component)
9. [Badge Component](#badge-component)
10. [Button Component](#button-component)

---

## API Client

**File**: `src/api/apiClient.js`

### Features

- Factory pattern for creating resource APIs
- Built-in query parameter handling
- Full CRUD operations
- File upload support
- Special methods (like, endorse, reorder, etc.)

### Usage

```javascript
import { api } from "../api/apiClient";

// Get all works with filters
const works = await api.works.getAll({
  category: "web",
  featured: true,
  sort: "-createdAt",
  limit: 10,
});

// Get single work
const work = await api.works.getOne("work-id");

// Create work with image upload
const newWork = await api.works.create({
  title: "My Project",
  description: "Description",
  category: "web",
});
await api.works.uploadImage("work-id", imageFile);

// Update work
await api.works.update("work-id", { title: "Updated Title" });

// Toggle featured status
await api.works.toggleFeatured("work-id", true);

// Like a work
await api.works.like("work-id");

// Get statistics
const stats = await api.works.getStats();
```

### Available Resources

All resources have standard CRUD methods:

- `getAll(params)` - Get all items with filtering/sorting/pagination
- `getOne(id)` - Get single item
- `create(data)` - Create new item
- `update(id, data)` - Update item
- `delete(id)` - Soft delete item
- `restore(id)` - Restore soft deleted item
- `toggleFeatured(id, value)` - Toggle featured status
- `togglePublished(id, value)` - Toggle published status
- `reorder(id, newOrder)` - Update display order
- `getStats()` - Get resource statistics

**Resources**: works, abouts, skills, research, testimonials, leadership, experiences, workExperiences, brands, awards, contacts, resumes

---

## Card Component

**File**: `src/components/Card/Card.jsx`

Universal card component for displaying content items (works, skills, awards, publications, testimonials, etc.)

### Props

| Prop          | Type     | Default   | Description                                  |
| ------------- | -------- | --------- | -------------------------------------------- |
| `image`       | string   | -         | Image URL                                    |
| `title`       | string   | -         | Card title                                   |
| `subtitle`    | string   | -         | Card subtitle                                |
| `description` | string   | -         | Card description                             |
| `tags`        | array    | []        | Array of tag strings                         |
| `badge`       | object   | null      | Badge object: `{text, type}`                 |
| `link`        | string   | -         | External link URL                            |
| `onLike`      | function | -         | Like button handler                          |
| `likes`       | number   | 0         | Number of likes                              |
| `featured`    | boolean  | false     | Show featured badge                          |
| `onClick`     | function | -         | Card click handler                           |
| `variant`     | string   | 'default' | Variant: default, compact, featured, minimal |
| `footer`      | node     | -         | Custom footer content                        |
| `actions`     | node     | -         | Custom action buttons                        |
| `className`   | string   | ''        | Additional CSS classes                       |

### Variants

- **default**: Standard card (200px image, full padding)
- **compact**: Smaller card (150px image, reduced padding)
- **featured**: Purple border with enhanced shadow
- **minimal**: No shadow, light border only

### Usage

```javascript
import { Card } from '../components';

// Basic card
<Card
  image={work.imgUrl}
  title={work.title}
  description={work.description}
  tags={work.tags}
/>

// Featured work card
<Card
  variant="featured"
  featured
  image={work.imgUrl}
  title={work.title}
  subtitle={work.category}
  description={work.description}
  tags={work.tags}
  likes={work.likes}
  onLike={() => handleLike(work._id)}
  onClick={() => handleViewDetails(work._id)}
/>

// Skill card (compact)
<Card
  variant="compact"
  image={skill.icon}
  title={skill.name}
  subtitle={`${skill.proficiency}%`}
  tags={[skill.category]}
  badge={{ text: 'Featured', type: 'featured' }}
/>

// Publication card with custom footer
<Card
  image={pub.image}
  title={pub.title}
  subtitle={pub.authors}
  description={pub.abstract}
  tags={pub.keywords}
  footer={
    <div>
      <p>Citations: {pub.citations}</p>
      <p>Published: {pub.year}</p>
    </div>
  }
  actions={
    <Button onClick={() => handleDownload(pub._id)}>
      Download PDF
    </Button>
  }
/>
```

---

## Grid Component

**File**: `src/components/Grid/Grid.jsx`

Flexible grid layout component for all list views.

### Props

| Prop        | Type   | Default   | Description                          |
| ----------- | ------ | --------- | ------------------------------------ |
| `columns`   | number | 3         | Number of columns: 1, 2, 3, 4        |
| `gap`       | string | 'medium'  | Gap size: small, medium, large       |
| `variant`   | string | 'default' | Variant: default, masonry, auto-fit  |
| `className` | string | ''        | Additional CSS classes               |
| `children`  | node   | -         | Grid items (usually Card components) |

### Variants

- **default**: Fixed columns with equal heights
- **masonry**: Pinterest-style masonry layout
- **auto-fit**: Responsive with `minmax(280px, 1fr)`

### Usage

```javascript
import { Grid, Card } from '../components';

// 3-column grid (default)
<Grid>
  {works.map(work => (
    <Card key={work._id} {...work} />
  ))}
</Grid>

// 4-column grid with small gaps
<Grid columns={4} gap="small">
  {skills.map(skill => (
    <Card key={skill._id} {...skill} />
  ))}
</Grid>

// Auto-fit responsive grid
<Grid variant="auto-fit" gap="large">
  {items.map(item => (
    <Card key={item._id} {...item} />
  ))}
</Grid>

// Masonry layout
<Grid variant="masonry">
  {publications.map(pub => (
    <Card key={pub._id} {...pub} />
  ))}
</Grid>
```

---

## FilterBar Component

**File**: `src/components/FilterBar/FilterBar.jsx`

Universal filter, search, and sort bar for filtered lists.

### Props

| Prop                | Type     | Default     | Description                                     |
| ------------------- | -------- | ----------- | ----------------------------------------------- |
| `filters`           | array    | []          | Filter options: `[{value, label, icon, count}]` |
| `activeFilter`      | string   | 'all'       | Currently active filter value                   |
| `onFilterChange`    | function | -           | Filter change handler                           |
| `showSearch`        | boolean  | true        | Show/hide search input                          |
| `searchValue`       | string   | ''          | Current search value                            |
| `onSearchChange`    | function | -           | Search change handler                           |
| `searchPlaceholder` | string   | 'Search...' | Search placeholder text                         |
| `sortOptions`       | array    | []          | Sort options: `[{value, label}]`                |
| `sortValue`         | string   | ''          | Current sort value                              |
| `onSortChange`      | function | -           | Sort change handler                             |
| `className`         | string   | ''          | Additional CSS classes                          |

### Usage

```javascript
import { FilterBar } from "../components";

const [activeFilter, setActiveFilter] = useState("all");
const [searchValue, setSearchValue] = useState("");
const [sortValue, setSortValue] = useState("-createdAt");

<FilterBar
  filters={[
    { value: "all", label: "All", count: 45 },
    { value: "web", label: "Web Dev", icon: "🌐", count: 20 },
    { value: "mobile", label: "Mobile", icon: "📱", count: 15 },
    { value: "design", label: "Design", icon: "🎨", count: 10 },
  ]}
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
  searchValue={searchValue}
  onSearchChange={(e) => setSearchValue(e.target.value)}
  searchPlaceholder="Search projects..."
  sortOptions={[
    { value: "-createdAt", label: "Newest First" },
    { value: "createdAt", label: "Oldest First" },
    { value: "title", label: "Title (A-Z)" },
    { value: "-likes", label: "Most Liked" },
  ]}
  sortValue={sortValue}
  onSortChange={(e) => setSortValue(e.target.value)}
/>;
```

---

## Loading Component

**File**: `src/components/Loading/Loading.jsx`

Loading states with multiple variants.

### Props

| Prop        | Type    | Default   | Description                                      |
| ----------- | ------- | --------- | ------------------------------------------------ |
| `variant`   | string  | 'spinner' | Variant: spinner, skeleton, pulse, dots, overlay |
| `size`      | string  | 'medium'  | Size: small, medium, large                       |
| `count`     | number  | 1         | Number of skeleton items                         |
| `message`   | string  | ''        | Loading message                                  |
| `overlay`   | boolean | false     | Full-page overlay                                |
| `className` | string  | ''        | Additional CSS classes                           |

### Variants

- **spinner**: Rotating spinner
- **skeleton**: Content placeholder (card skeletons)
- **pulse**: Pulsing square
- **dots**: Three animated dots
- **overlay**: Full-page loading screen

### Usage

```javascript
import { Loading } from '../components';

// Spinner
<Loading variant="spinner" size="large" />

// Skeleton (3 card placeholders)
<Loading variant="skeleton" count={3} />

// Full-page overlay
<Loading
  variant="overlay"
  message="Loading your content..."
/>

// Conditional loading
{loading ? (
  <Loading variant="spinner" />
) : (
  <Grid>
    {data.map(item => <Card key={item._id} {...item} />)}
  </Grid>
)}
```

---

## EmptyState Component

**File**: `src/components/EmptyState/EmptyState.jsx`

Displayed when there's no data to show.

### Props

| Prop        | Type   | Default         | Description                        |
| ----------- | ------ | --------------- | ---------------------------------- |
| `icon`      | string | '📭'            | Emoji icon                         |
| `title`     | string | 'No data found' | Empty state title                  |
| `message`   | string | ''              | Empty state message                |
| `action`    | object | null            | Action button: `{label, onClick}`  |
| `variant`   | string | 'default'       | Variant: default, compact, minimal |
| `className` | string | ''              | Additional CSS classes             |

### Usage

```javascript
import { EmptyState } from '../components';

// No results
<EmptyState
  icon="🔍"
  title="No results found"
  message="Try adjusting your search or filters"
  action={{
    label: 'Clear Filters',
    onClick: handleClearFilters
  }}
/>

// No data yet
<EmptyState
  icon="📝"
  title="No projects yet"
  message="Start by adding your first project"
  action={{
    label: 'Add Project',
    onClick: handleAddProject
  }}
/>

// Conditional rendering
{data.length === 0 ? (
  <EmptyState
    icon="📭"
    title="No items found"
  />
) : (
  <Grid>
    {data.map(item => <Card key={item._id} {...item} />)}
  </Grid>
)}
```

---

## ErrorBoundary Component

**File**: `src/components/ErrorBoundary/ErrorBoundary.jsx`

Catches React errors and displays fallback UI.

### Props

| Prop       | Type | Default | Description        |
| ---------- | ---- | ------- | ------------------ |
| `children` | node | -       | Components to wrap |
| `fallback` | node | null    | Custom fallback UI |

### Usage

```javascript
import { ErrorBoundary } from '../components';

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Wrap specific sections
<ErrorBoundary>
  <WorkContainer />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary
  fallback={
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

---

## Timeline Component

**File**: `src/components/Timeline/Timeline.jsx`

Displays items in chronological order (for experiences, awards, etc.)

### Props

| Prop        | Type   | Default    | Description                   |
| ----------- | ------ | ---------- | ----------------------------- |
| `items`     | array  | []         | Timeline items                |
| `variant`   | string | 'vertical' | Variant: vertical, horizontal |
| `className` | string | ''         | Additional CSS classes        |

### Item Structure

```javascript
{
  date: '2023',
  title: 'Position Title',
  subtitle: 'Company Name',
  description: 'Description text',
  achievements: ['Achievement 1', 'Achievement 2'],
  tags: ['tag1', 'tag2'],
  icon: '🎯',
  image: 'logo.png',
  link: { url: 'https://...', label: 'Learn More' }
}
```

### Usage

```javascript
import { Timeline } from '../components';

const experiences = [
  {
    date: '2023 - Present',
    icon: '💼',
    image: '/logos/company.png',
    title: 'Senior Developer',
    subtitle: 'Company Name',
    description: 'Leading development team...',
    achievements: [
      'Increased performance by 40%',
      'Led team of 5 developers',
      'Implemented CI/CD pipeline'
    ],
    tags: ['React', 'Node.js', 'AWS'],
    link: {
      url: 'https://company.com',
      label: 'Visit Company'
    }
  },
  // More items...
];

<Timeline items={experiences} variant="vertical" />

// Horizontal timeline
<Timeline items={awards} variant="horizontal" />
```

---

## Badge Component

**File**: `src/components/Badge/Badge.jsx`

Small status indicator or label.

### Props

| Prop        | Type    | Default   | Description                |
| ----------- | ------- | --------- | -------------------------- |
| `children`  | node    | -         | Badge text                 |
| `variant`   | string  | 'default' | Variant (see below)        |
| `size`      | string  | 'medium'  | Size: small, medium, large |
| `icon`      | string  | null      | Optional icon              |
| `dot`       | boolean | false     | Show pulsing dot           |
| `className` | string  | ''        | Additional CSS classes     |

### Variants

- **default**: Gray
- **primary**: Purple gradient
- **success**: Green gradient
- **warning**: Orange gradient
- **danger**: Red gradient
- **info**: Blue gradient
- **featured**: Gold gradient
- **outline-primary**: Transparent with purple border
- **outline-success**: Transparent with green border
- **outline-warning**: Transparent with orange border
- **outline-danger**: Transparent with red border

### Usage

```javascript
import { Badge } from '../components';

// Basic badge
<Badge variant="success">Active</Badge>

// With icon
<Badge variant="warning" icon="⚠️">Pending</Badge>

// With pulsing dot
<Badge variant="primary" dot>New</Badge>

// Featured badge
<Badge variant="featured">⭐ Featured</Badge>

// On cards
<Card
  title="Project"
  badge={<Badge variant="success">Published</Badge>}
/>
```

---

## Button Component

**File**: `src/components/Button/Button.jsx`

Reusable button with multiple variants.

### Props

| Prop           | Type     | Default   | Description                        |
| -------------- | -------- | --------- | ---------------------------------- |
| `children`     | node     | -         | Button text                        |
| `variant`      | string   | 'primary' | Variant (see below)                |
| `size`         | string   | 'medium'  | Size: small, medium, large         |
| `icon`         | string   | null      | Optional icon                      |
| `iconPosition` | string   | 'left'    | Icon position: left, right         |
| `loading`      | boolean  | false     | Show loading spinner               |
| `disabled`     | boolean  | false     | Disabled state                     |
| `fullWidth`    | boolean  | false     | Full width button                  |
| `type`         | string   | 'button'  | Button type: button, submit, reset |
| `onClick`      | function | -         | Click handler                      |
| `className`    | string   | ''        | Additional CSS classes             |

### Variants

- **primary**: Purple gradient (default)
- **secondary**: Gray gradient
- **success**: Green gradient
- **danger**: Red gradient
- **outline**: Transparent with border
- **ghost**: Transparent, no border
- **link**: Underlined text link

### Usage

```javascript
import { Button } from '../components';

// Primary button
<Button onClick={handleClick}>
  Click Me
</Button>

// With icon
<Button variant="primary" icon="🚀" iconPosition="left">
  Launch Project
</Button>

// Loading state
<Button loading>
  Saving...
</Button>

// Outline variant
<Button variant="outline" size="large">
  Learn More
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit Form
</Button>

// On cards
<Card
  title="Project"
  actions={
    <>
      <Button variant="primary" size="small">
        View Details
      </Button>
      <Button variant="outline" size="small">
        Source Code
      </Button>
    </>
  }
/>
```

---

## Complete Example

Here's a complete example combining multiple components:

```javascript
import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  FilterBar,
  Loading,
  EmptyState,
  ErrorBoundary,
  Badge,
  Button,
} from "../components";
import { api } from "../api/apiClient";

const WorkContainer = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("-createdAt");

  useEffect(() => {
    fetchWorks();
  }, [activeFilter, sortValue]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = {
        category: activeFilter !== "all" ? activeFilter : undefined,
        sort: sortValue,
        search: searchValue || undefined,
      };
      const data = await api.works.getAll(params);
      setWorks(data);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      await api.works.like(id);
      fetchWorks(); // Refresh data
    } catch (error) {
      console.error("Error liking work:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="work-container">
        <FilterBar
          filters={[
            { value: "all", label: "All Works", count: 45 },
            { value: "web", label: "Web Dev", icon: "🌐", count: 20 },
            { value: "mobile", label: "Mobile", icon: "📱", count: 15 },
            { value: "design", label: "Design", icon: "🎨", count: 10 },
          ]}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          sortOptions={[
            { value: "-createdAt", label: "Newest First" },
            { value: "title", label: "Title (A-Z)" },
            { value: "-likes", label: "Most Liked" },
          ]}
          sortValue={sortValue}
          onSortChange={(e) => setSortValue(e.target.value)}
        />

        {loading ? (
          <Loading variant="skeleton" count={6} />
        ) : works.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No projects found"
            message="Try adjusting your filters"
            action={{
              label: "Clear Filters",
              onClick: () => {
                setActiveFilter("all");
                setSearchValue("");
              },
            }}
          />
        ) : (
          <Grid columns={3} gap="medium">
            {works.map((work) => (
              <Card
                key={work._id}
                variant={work.featured ? "featured" : "default"}
                featured={work.featured}
                image={work.imgUrl}
                title={work.title}
                subtitle={work.category}
                description={work.description}
                tags={work.tags}
                likes={work.likes}
                onLike={() => handleLike(work._id)}
                badge={
                  work.featured && <Badge variant="featured">⭐ Featured</Badge>
                }
                actions={
                  <>
                    <Button variant="primary" size="small">
                      View Details
                    </Button>
                    {work.projectLink && (
                      <Button variant="outline" size="small">
                        Visit Site
                      </Button>
                    )}
                  </>
                }
              />
            ))}
          </Grid>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default WorkContainer;
```

---

## Best Practices

### 1. Component Composition

Always compose components rather than creating new ones:

```javascript
// ✅ Good - Compose existing components
<Card variant="compact" />

// ❌ Bad - Create new component
<SkillCard />
```

### 2. Consistent Prop Naming

Use consistent prop names across components:

- `variant` for style variants
- `size` for size variations
- `className` for custom classes
- `onClick` for click handlers

### 3. Loading States

Always handle loading states:

```javascript
{
  loading ? (
    <Loading variant="skeleton" count={3} />
  ) : (
    <Grid>
      {data.map((item) => (
        <Card {...item} />
      ))}
    </Grid>
  );
}
```

### 4. Empty States

Handle empty data gracefully:

```javascript
{
  data.length === 0 ? (
    <EmptyState icon="📭" title="No data" />
  ) : (
    <Grid>
      {data.map((item) => (
        <Card {...item} />
      ))}
    </Grid>
  );
}
```

### 5. Error Boundaries

Wrap containers in ErrorBoundary:

```javascript
<ErrorBoundary>
  <MyContainer />
</ErrorBoundary>
```

### 6. API Integration

Use the enhanced API client:

```javascript
// ✅ Good
import { api } from "../api/apiClient";
const data = await api.works.getAll({ featured: true });

// ❌ Bad
fetch("/api/works?featured=true");
```

---

## Next Steps

1. **Update Existing Containers**: Refactor Work, About, Skills, Experience, Awards containers to use new components
2. **Create New Containers**: Build Research, Testimonials, Leadership containers
3. **Admin Dashboard**: Create content management interface
4. **Testing**: Test all components and integrations
5. **Performance**: Optimize bundle size and loading times

---

## Support

For questions or issues, refer to:

- Component source code in `src/components/`
- API client source in `src/api/apiClient.js`
- Backend API documentation in `backend_api/docs/`
