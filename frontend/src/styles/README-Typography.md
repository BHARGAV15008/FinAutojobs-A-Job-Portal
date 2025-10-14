# Typography System Documentation

## Overview
This project now uses a comprehensive typography system to ensure consistent, medium-sized fonts throughout the application. No more oversized or inconsistent text!

## How It Works

### 1. Global Typography Fix
The entire app now uses the `typography-fix` class applied to the root container in `App.jsx`. This ensures all child components inherit proper font sizing.

### 2. Font Size Standards
- **Extra Small**: 0.75rem (12px) - For labels, badges, captions
- **Small**: 0.875rem (14px) - For body text, buttons, forms (DEFAULT)
- **Base**: 0.875rem (14px) - Same as small, our standard size
- **Large**: 1rem (16px) - For emphasized text
- **XL**: 1.125rem (18px) - For card titles, section headers
- **2XL**: 1.25rem (20px) - For page subtitles
- **3XL**: 1.5rem (24px) - For page titles
- **4XL**: 1.875rem (30px) - For main headings only

### 3. Component-Specific Classes

#### Headings
- `.heading-xl` - Main page headings (1.875rem)
- `.heading-lg` - Section headings (1.5rem)
- `.heading-md` - Subsection headings (1.25rem)
- `.heading-sm` - Card/component headings (1.125rem)

#### Text Sizes
- `.text-tiny` - 0.75rem
- `.text-small` - 0.875rem (default)
- `.text-medium` - 0.875rem
- `.text-large` - 1rem

#### Buttons
- `.btn-small` - Compact buttons (0.75rem)
- `.btn-primary` / `.btn-secondary` - Standard buttons (0.875rem)
- `.btn-large` - Prominent buttons (1rem)

#### Cards
- `.card-title` - Card headings (1.125rem, semibold)
- `.card-subtitle` - Card subheadings (0.875rem, medium)
- `.card-text` - Card body text (0.875rem, normal)

#### Forms
- `.label-text` - Form labels (0.875rem, medium)
- `.help-text` - Help/hint text (0.75rem, normal)

#### Navigation
- `.nav-link` - Navigation items (0.875rem, medium)
- `.nav-link-active` - Active nav items (0.875rem, semibold)

#### Tables
- `.table-header` - Table headers (0.75rem, semibold, uppercase)
- `.table-cell` - Table data (0.875rem, normal)
- `.table-cell-secondary` - Secondary table data (0.875rem, muted)

#### Dashboard
- `.dashboard-title` - Dashboard page titles (1.5rem, semibold)
- `.dashboard-subtitle` - Dashboard subtitles (1rem, medium)
- `.metric-value` - Large numbers/stats (1.5rem, bold)
- `.metric-label` - Metric labels (0.75rem, medium, uppercase)

#### Job Listings
- `.job-title` - Job position titles (1.125rem, semibold)
- `.job-company` - Company names (0.875rem, medium)
- `.job-location` - Location text (0.75rem, normal)

#### User Info
- `.user-name` - User display names (1rem, semibold)
- `.user-role` - User roles/titles (0.75rem, medium)
- `.user-email` - Email addresses (0.875rem, normal)

## Usage Examples

### Basic Usage
```jsx
// The typography-fix class is already applied globally in App.jsx
<div className="typography-fix">
  <h1>This will be properly sized</h1>
  <p>This text will be 0.875rem</p>
  <button>This button will be properly sized</button>
</div>
```

### Using Utility Classes
```jsx
<div>
  <h2 className="heading-lg">Section Title</h2>
  <p className="text-small">Body text</p>
  <button className="btn-primary">Action Button</button>
  <span className="text-tiny">Small caption</span>
</div>
```

### Card Example
```jsx
<div className="card">
  <h3 className="card-title">Card Title</h3>
  <p className="card-subtitle">Card Subtitle</p>
  <div className="card-text">
    Card content goes here...
  </div>
</div>
```

### Dashboard Example
```jsx
<div>
  <h1 className="dashboard-title">Dashboard</h1>
  <p className="dashboard-subtitle">Welcome back!</p>
  
  <div className="metric">
    <div className="metric-value">1,234</div>
    <div className="metric-label">Total Users</div>
  </div>
</div>
```

## Font Weights
- **Normal (400)**: Body text, descriptions
- **Medium (500)**: Labels, navigation, buttons
- **Semibold (600)**: Headings, titles, emphasis
- **Bold (700)**: Main headings, metrics, important numbers

## Line Heights
- **1.2**: Large headings (h1, h2)
- **1.3**: Medium headings (h3, h4)
- **1.4**: Small headings, buttons
- **1.5**: Body text, paragraphs (default)

## Responsive Behavior
On mobile devices (< 640px):
- Main headings reduce by ~0.25rem
- Dashboard titles become more compact
- Metric values scale down appropriately

## Important Notes
1. **All sizes use `!important`** to override any existing large fonts
2. **The system is applied globally** via the App.jsx root container
3. **Tailwind classes are overridden** to prevent oversized text
4. **Material-UI components are also controlled** with specific overrides
5. **Line heights are consistent** across all text elements

## Troubleshooting
If you see oversized fonts:
1. Ensure the component is inside the `typography-fix` container
2. Check if there are inline styles overriding the CSS
3. Use browser dev tools to see which CSS rules are being applied
4. Add the appropriate utility class for the specific component type

## Files Modified
- `src/index.css` - Main typography overrides
- `src/styles/typography-fixes.css` - Comprehensive typography system
- `tailwind.config.js` - Font size configuration
- `src/App.jsx` - Global typography-fix class application
