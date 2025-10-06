# Frontend Quick Reference Guide

## 🚀 Quick Start

```javascript
// Import components
import {
  Card,
  Grid,
  FilterBar,
  Loading,
  EmptyState,
  ErrorBoundary,
  Timeline,
  Badge,
  Button,
} from "../components";

// Import API client
import { api } from "../api/apiClient";
```

---

## 📦 Component Cheat Sheet

### Card

```jsx
<Card
  variant="default|compact|featured|minimal"
  image={url}
  title="Title"
  subtitle="Subtitle"
  description="Description"
  tags={["tag1", "tag2"]}
  featured={true}
  likes={10}
  onLike={handler}
  onClick={handler}
/>
```

### Grid

```jsx
<Grid
  columns={1 | 2 | 3 | 4}
  gap="small|medium|large"
  variant="default|masonry|auto-fit"
>
  {items.map((item) => (
    <Card key={item._id} {...item} />
  ))}
</Grid>
```

### FilterBar

```jsx
<FilterBar
  filters={[{ value, label, icon, count }]}
  activeFilter="all"
  onFilterChange={handler}
  searchValue=""
  onSearchChange={handler}
  sortOptions={[{ value, label }]}
  sortValue=""
  onSortChange={handler}
/>
```

### Loading

```jsx
<Loading
  variant="spinner|skeleton|pulse|dots|overlay"
  size="small|medium|large"
  count={3}
  message="Loading..."
/>
```

### EmptyState

```jsx
<EmptyState
  icon="📭"
  title="No data"
  message="Message"
  action={{ label: "Action", onClick: handler }}
  variant="default|compact|minimal"
/>
```

### Timeline

```jsx
<Timeline
  items={[
    {
      date: "2023",
      icon: "🎯",
      image: "logo.png",
      title: "Title",
      subtitle: "Subtitle",
      description: "Description",
      achievements: ["Item 1", "Item 2"],
      tags: ["tag1", "tag2"],
      link: { url: "https://...", label: "Link" },
    },
  ]}
  variant="vertical|horizontal"
/>
```

### Badge

```jsx
<Badge
  variant="default|primary|success|warning|danger|info|featured|outline-*"
  size="small|medium|large"
  icon="⚠️"
  dot={true}
>
  Text
</Badge>
```

### Button

```jsx
<Button
  variant="primary|secondary|success|danger|outline|ghost|link"
  size="small|medium|large"
  icon="🚀"
  iconPosition="left|right"
  loading={false}
  disabled={false}
  fullWidth={false}
  onClick={handler}
>
  Click Me
</Button>
```

### ErrorBoundary

```jsx
<ErrorBoundary fallback={<CustomUI />}>
  <YourComponent />
</ErrorBoundary>
```

---

## 🔌 API Client Cheat Sheet

### Standard Methods (all resources)

```javascript
// GET all with filters
await api.resource.getAll({
  category: "value",
  featured: true,
  published: true,
  sort: "-createdAt", // - prefix for descending
  limit: 10,
  skip: 0,
  search: "query",
});

// GET one
await api.resource.getOne(id);

// CREATE
await api.resource.create(data);

// UPDATE
await api.resource.update(id, data);

// DELETE (soft delete)
await api.resource.delete(id);

// RESTORE
await api.resource.restore(id);

// TOGGLE FEATURED
await api.resource.toggleFeatured(id, true);

// TOGGLE PUBLISHED
await api.resource.togglePublished(id, true);

// REORDER
await api.resource.reorder(id, newOrder);

// GET STATS
await api.resource.getStats();
```

### Resources with Upload

```javascript
// Works, Abouts, Skills, Testimonials, Leadership, etc.
await api.works.uploadImage(id, file);
await api.skills.uploadIcon(id, file);
await api.testimonials.uploadAvatar(id, file);
await api.testimonials.uploadLogo(id, file);
```

### Special Methods

```javascript
// Works - Like
await api.works.like(id);

// Skills - Endorse
await api.skills.endorse(id);

// Skills - Get by category
await api.skills.getStatsByCategory();

// Research - Track download
await api.research.publications.trackDownload(id);

// Research - Update citations
await api.research.publications.updateCitations(id, count);

// Research - Get timeline
await api.research.publications.getTimeline();

// Contacts - Mark read/unread
await api.contacts.markRead(id);
await api.contacts.markUnread(id);

// Contacts - Reply
await api.contacts.reply(id, replyData);

// Resumes - Set active
await api.resumes.setActive(id);

// Resumes - Get active
await api.resumes.getActive();

// Resumes - Track download
await api.resumes.trackDownload(id);
```

---

## 🎨 Design System

### Colors

```scss
--primary-color: #6366f1;
--text-color: #374151;
--secondary-text-color: #6b7280;
```

### Gradients

```css
/* Primary */
linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)

/* Success */
linear-gradient(135deg, #10b981, #059669)

/* Warning */
linear-gradient(135deg, #f59e0b, #d97706)

/* Danger */
linear-gradient(135deg, #ef4444, #dc2626)

/* Featured */
linear-gradient(135deg, #fbbf24, #f59e0b)

/* Gray */
linear-gradient(135deg, #f3f4f6, #e5e7eb)
```

### Shadows

```css
/* Light */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

/* Medium */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* Heavy */
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

/* Primary */
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
```

### Border Radius

```css
border-radius: 8px; /* Small */
border-radius: 10px; /* Medium */
border-radius: 12px; /* Large */
border-radius: 16px; /* XLarge */
```

### Spacing

```css
gap: 1rem; /* Small */
gap: 1.5rem; /* Medium */
gap: 2rem; /* Large */
```

---

## 📱 Responsive Breakpoints

```scss
/* Desktop: Default */

/* Tablet */
@media screen and (max-width: 900px) {
}

/* Mobile */
@media screen and (max-width: 600px) {
}

/* Small Mobile */
@media screen and (max-width: 480px) {
}
```

---

## 🔄 Common Patterns

### Basic Container Pattern

```javascript
const Container = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.resource.getAll();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading variant="skeleton" count={6} />;
  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <EmptyState title="No data" />;

  return (
    <Grid columns={3}>
      {data.map((item) => (
        <Card key={item._id} {...item} />
      ))}
    </Grid>
  );
};
```

### Filtered Container Pattern

```javascript
const FilteredContainer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("-createdAt");

  useEffect(() => {
    fetchData();
  }, [activeFilter, sortValue]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.resource.getAll({
        category: activeFilter !== "all" ? activeFilter : undefined,
        sort: sortValue,
        search: searchValue || undefined,
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== undefined) fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  return (
    <ErrorBoundary>
      <FilterBar
        filters={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchValue={searchValue}
        onSearchChange={handleSearch}
        sortOptions={SORT_OPTIONS}
        sortValue={sortValue}
        onSortChange={(e) => setSortValue(e.target.value)}
      />

      {loading ? (
        <Loading variant="skeleton" count={6} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No results"
          action={{
            label: "Clear Filters",
            onClick: () => {
              setActiveFilter("all");
              setSearchValue("");
            },
          }}
        />
      ) : (
        <Grid columns={3}>
          {data.map((item) => (
            <Card key={item._id} {...item} />
          ))}
        </Grid>
      )}
    </ErrorBoundary>
  );
};
```

### Timeline Container Pattern

```javascript
const TimelineContainer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.resource.getTimeline();
        setData(result);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading variant="spinner" />;
  if (data.length === 0) return <EmptyState title="No timeline data" />;

  return (
    <Timeline
      items={data.map((item) => ({
        date: item.year || item.date,
        icon: "🎯",
        image: item.logo,
        title: item.title,
        subtitle: item.company || item.organization,
        description: item.description,
        achievements: item.achievements,
        tags: item.tags,
        link: item.link && {
          url: item.link,
          label: "Learn More",
        },
      }))}
      variant="vertical"
    />
  );
};
```

---

## 🎯 Tips & Tricks

### 1. Debounce Search

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    fetchData();
  }, 500);
  return () => clearTimeout(timer);
}, [searchValue]);
```

### 2. Optimistic Updates

```javascript
const handleLike = async (id) => {
  // Update UI immediately
  setData(
    data.map((item) =>
      item._id === id ? { ...item, likes: item.likes + 1 } : item
    )
  );

  // Then sync with server
  try {
    await api.works.like(id);
  } catch (error) {
    // Revert on error
    fetchData();
  }
};
```

### 3. Skeleton Loading Count

```javascript
// Match expected grid columns
<Loading variant="skeleton" count={6} /> // 3 columns × 2 rows
```

### 4. Filter Counts

```javascript
const filters = [
  { value: "all", label: "All", count: data.length },
  {
    value: "web",
    label: "Web",
    count: data.filter((d) => d.category === "web").length,
  },
];
```

### 5. Featured Items First

```javascript
const sortedData = [...data].sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return 0;
});
```

---

## 📁 File Structure

```
src/
├── api/
│   └── apiClient.js          # Enhanced API client
├── components/
│   ├── Card/                 # Universal card
│   ├── Grid/                 # Flexible grid
│   ├── FilterBar/            # Filter/search/sort
│   ├── Loading/              # Loading states
│   ├── EmptyState/           # Empty states
│   ├── ErrorBoundary/        # Error handling
│   ├── Timeline/             # Chronological display
│   ├── Badge/                # Status indicators
│   ├── Button/               # Buttons
│   └── index.js              # Component exports
├── container/
│   ├── Work/                 # Work container
│   ├── About/                # About container
│   ├── Skills/               # Skills container
│   ├── Experience/           # Experience container
│   ├── Awards/               # Awards container
│   ├── Research/             # Research container (new)
│   ├── Testimonials/         # Testimonials (new)
│   └── Leadership/           # Leadership (new)
└── pages/
    ├── Dashboard/            # Admin dashboard
    └── Contact/              # Contact page
```

---

## ✅ Checklist for New Container

- [ ] Import required components from `../components`
- [ ] Import API client: `import { api } from '../api/apiClient'`
- [ ] Set up state: `data`, `loading`, `error`
- [ ] Fetch data in `useEffect`
- [ ] Handle loading state with `<Loading />`
- [ ] Handle empty state with `<EmptyState />`
- [ ] Handle error state
- [ ] Wrap in `<ErrorBoundary>`
- [ ] Use `<Grid>` for list layouts
- [ ] Use `<Card>` for items
- [ ] Use `<FilterBar>` if filtering needed
- [ ] Use `<Timeline>` for chronological data
- [ ] Add responsive styles
- [ ] Test on mobile

---

## 🐛 Common Issues

### Issue: Components not animating

**Solution**: Ensure Framer Motion is installed

```bash
npm install framer-motion
```

### Issue: Styles not applying

**Solution**: Import SCSS files in component

```javascript
import "./Component.scss";
```

### Issue: API calls failing

**Solution**: Check backend API is running and CORS is configured

### Issue: Grid columns not responsive

**Solution**: Use breakpoints in SCSS or `variant="auto-fit"`

---

## 📚 Further Reading

- Full documentation: `FRONTEND_COMPONENTS_DOCUMENTATION.md`
- Enhancement summary: `FRONTEND_ENHANCEMENT_SUMMARY.md`
- Backend API docs: `backend_api/docs/`

---

**Happy Coding! 🚀**
