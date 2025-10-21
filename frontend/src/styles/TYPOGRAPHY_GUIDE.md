# FinAutoJobs Typography Guide

## Overview
This guide explains how to use the enhanced typography system in FinAutoJobs, featuring Inter as the primary font and Work Sans for headings.

## Font Stack
- **Primary**: Inter (300, 400, 500, 600, 700, 800)
- **Headings**: Work Sans (400, 500, 600, 700)
- **Fallbacks**: System fonts for performance

## Usage Methods

### 1. CSS Classes (Recommended)
```html
<!-- Hero sections -->
<h1 class="heading-hero">Find Your Dream Job</h1>

<!-- Section headings -->
<h2 class="heading-section">Featured Jobs</h2>

<!-- Job cards -->
<h3 class="job-title">Senior Frontend Developer</h3>
<span class="company-name">Google</span>
<span class="salary-text">₹15-25L</span>

<!-- Body text -->
<p class="body-regular">Job description goes here...</p>
<span class="job-meta">2 days ago • Remote</span>
```

### 2. React Components
```jsx
import { 
  HeroHeading, 
  SectionHeading, 
  JobTitle, 
  CompanyName, 
  SalaryText 
} from '../components/ui/Typography';

function JobCard() {
  return (
    <div>
      <JobTitle>Senior Frontend Developer</JobTitle>
      <CompanyName>Google</CompanyName>
      <SalaryText>₹15-25L</SalaryText>
    </div>
  );
}
```

### 3. Tailwind Classes
```html
<!-- Using font families -->
<h1 class="font-heading font-bold text-4xl">Heading with Work Sans</h1>
<p class="font-body font-normal text-base">Body text with Inter</p>

<!-- Using font weights -->
<span class="font-medium">Medium weight</span>
<span class="font-semibold">Semi-bold weight</span>
<span class="font-extrabold">Extra bold weight</span>
```

## Typography Scale

### Headings
- **Hero**: 2.5rem - 4rem (responsive)
- **Section**: 1.5rem - 2.25rem (responsive)
- **Card**: 1.125rem - 1.5rem (responsive)

### Body Text
- **Large**: 1.125rem (18px)
- **Regular**: 1rem (16px)
- **Small**: 0.875rem (14px)

### Specialized
- **Job Title**: 1.25rem, font-weight: 600
- **Company Name**: 1rem, font-weight: 500, color: blue
- **Salary**: 1.125rem, font-weight: 600, color: green
- **Meta Info**: 0.875rem, font-weight: 400, color: gray

## Font Weights Available
- **300**: Light
- **400**: Regular/Normal
- **500**: Medium
- **600**: Semi-bold
- **700**: Bold
- **800**: Extra-bold

## Best Practices

### 1. Hierarchy
```jsx
// Good hierarchy example
<HeroHeading>Find Your Dream Job</HeroHeading>
<SectionHeading>Featured Positions</SectionHeading>
<JobTitle>Frontend Developer</JobTitle>
<BodyRegular>Job description...</BodyRegular>
```

### 2. Consistency
- Use `JobTitle` component for all job titles
- Use `CompanyName` component for all company names
- Use `SalaryText` component for all salary displays

### 3. Responsive Design
- Typography automatically scales on mobile
- Use `clamp()` functions for fluid scaling
- Test on different screen sizes

### 4. Accessibility
- Maintain proper contrast ratios
- Use semantic HTML elements
- Provide alternative text for important information

## Examples

### Job Card Component
```jsx
import { JobTitle, CompanyName, SalaryText, JobMeta } from '../ui/Typography';

function JobCard({ job }) {
  return (
    <div className="p-6 border rounded-lg">
      <JobTitle>{job.title}</JobTitle>
      <CompanyName>{job.company}</CompanyName>
      <SalaryText>₹{job.salary}</SalaryText>
      <JobMeta>{job.location} • {job.type}</JobMeta>
    </div>
  );
}
```

### Hero Section
```jsx
import { HeroHeading, BodyLarge } from '../ui/Typography';

function Hero() {
  return (
    <section className="text-center py-16">
      <HeroHeading>Find Your Dream Job</HeroHeading>
      <BodyLarge className="mt-4 text-gray-600">
        India's #1 job platform connecting millions of job seekers
      </BodyLarge>
    </section>
  );
}
```

### Dashboard Metrics
```jsx
import { DashboardMetric, DashboardLabel } from '../ui/Typography';

function MetricCard({ value, label }) {
  return (
    <div className="text-center p-4">
      <DashboardMetric>{value}</DashboardMetric>
      <DashboardLabel>{label}</DashboardLabel>
    </div>
  );
}
```

## Migration Guide

### From Material-UI Typography
```jsx
// Old
<Typography variant="h4" fontWeight="bold">
  Job Title
</Typography>

// New
<JobTitle>Job Title</JobTitle>
```

### From Inline Styles
```jsx
// Old
<h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
  Heading
</h1>

// New
<SectionHeading>Heading</SectionHeading>
```

## Performance Notes
- Fonts are preloaded in index.html
- Uses `font-display: swap` for better loading
- Includes system font fallbacks
- Optimized for Core Web Vitals

## Browser Support
- All modern browsers
- Graceful fallback to system fonts
- Works with font loading failures

## Dark Mode
Typography automatically adapts to dark mode preferences with appropriate color adjustments.
