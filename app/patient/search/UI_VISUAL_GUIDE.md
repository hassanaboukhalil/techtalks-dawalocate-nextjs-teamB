# 🎨 Patient Search Page - Visual & UI Guide

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     STICKY HEADER NAVIGATION                     │
│  DawaLocate Logo    [Home] [Search] [Admin]    [Search Medicines]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        HEADER SECTION                            │
│                    🔍 Find Medicines                             │
│          Search for medicines across pharmacies near you         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SEARCH FORM CARD                            │
│                                                                  │
│  Search Criteria                                                 │
│                                                                  │
│  Medicine Name *                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ e.g., Paracetamol, Aspirin, Ibuprofen         [cursor here]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │ City (Optional)  │ │Pharmacy (Optional)│ │Status Filter     │ │
│  │ e.g., Beirut     │ │e.g., Al-Shifa   │ │[In Stock & Low ▼]│ │
│  │ ┌──────────────┐ │ │ ┌──────────────┐ │ │                  │ │
│  │ │              │ │ │ │              │ │ │                  │ │
│  │ └──────────────┘ │ │ └──────────────┘ │ │                  │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                  │
│  ☑ Include out of stock items                                   │
│                                                                  │
│  [🔍 Search Medicines]                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RESULTS SUMMARY SECTION                       │
│                                                                  │
│  Found 3 pharmacies with 2 matching medicines                   │
│                                                                  │
│  Matching Medicines:                                             │
│  [Paracetamol 500mg (Tablet)] [Paracetamol 250mg (Syrup)]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PHARMACY RESULT #1                          │
│                                                                  │
│  Al-Shifa Central Pharmacy                                       │
│                                                                  │
│  📍 123 Hamra Street, Downtown    📍 Beirut                      │
│  📞 +961-1-123-4567              🚚 Delivery Available           │
│  ✉️  info@alshifa.com                                            │
│  🕐 Mon-Sat: 8AM-10PM, Sun: 10AM-6PM                            │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Available Medicines:                                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Paracetamol                      [✓ In Stock]        │       │
│  │ Generic: Acetaminophen                               │       │
│  │ 500mg (Tablet)                                       │       │
│  │                                                      │       │
│  │ Quantity: 150 units  │  Expires: Jan 15, 2026       │       │
│  │ Last Updated: Dec 6, 2025                           │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Paracetamol                      [⚠ Low Stock]       │       │
│  │ Generic: Acetaminophen                               │       │
│  │ 250mg (Syrup)                                        │       │
│  │                                                      │       │
│  │ Quantity: 8 units   │  Expires: Feb 20, 2026        │       │
│  │ Last Updated: Dec 5, 2025                           │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  [📞 Call Pharmacy]  [✉️ Email]                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PHARMACY RESULT #2                          │
│  ... (similar structure)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PHARMACY RESULT #3                          │
│  ... (similar structure)                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Coding Reference

### Status Badges

```
┌─────────────────────────────────────────────────┐
│ Status Badge Colors                             │
├─────────────────────────────────────────────────┤
│ ✓ In Stock   → 🟢 Green  (#10B981)             │
│ ⚠ Low Stock  → 🟡 Yellow (#FBBF24)            │
│ ✗ Out Stock  → 🔴 Red    (#EF4444)            │
└─────────────────────────────────────────────────┘
```

### Background Colors

```
┌─────────────────────────────────────────────────┐
│ Component Colors                                │
├─────────────────────────────────────────────────┤
│ Header         → 🔵 Blue gradient              │
│ Form Cards     → White with subtle border       │
│ Result Cards   → White with shadow              │
│ Medicine pills → 🔵 Light blue                 │
│ Error banner   → 🔴 Light red                  │
└─────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

### Mobile (< 640px)
```
┌─────────────────┐
│ MOBILE LAYOUT   │
├─────────────────┤
│  🔍 Find        │
│  Medicines      │
│                 │
│ ┌─────────────┐ │
│ │  Medicine   │ │
│ │  input      │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ City        │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Pharmacy    │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Status ▼    │ │
│ └─────────────┘ │
│                 │
│ ☑ Out of stock  │
│                 │
│ [Search]        │
│                 │
│ RESULTS...      │
└─────────────────┘
```

### Tablet (640px - 1024px)
```
┌────────────────────────────┐
│    TABLET LAYOUT           │
├────────────────────────────┤
│  🔍 Find Medicines         │
│                            │
│ ┌──────┐ ┌──────┐ ┌──────┐│
│ │ Med  │ │City  │ │Pharma││
│ │ input│ │input │ │input ││
│ └──────┘ └──────┘ └──────┘│
│                            │
│ ☑ Out of stock             │
│ [Status ▼] [Search]        │
│                            │
│ ─────────────────────────  │
│ RESULTS (2 columns)        │
│                            │
│ ┌─────────┐  ┌─────────┐   │
│ │Pharmacy1│  │Pharmacy2│   │
│ │         │  │         │   │
│ └─────────┘  └─────────┘   │
└────────────────────────────┘
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────────┐
│          DESKTOP LAYOUT                  │
├──────────────────────────────────────────┤
│ 🔍 Find Medicines                        │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Medicine │ │ City     │ │ Pharmacy │ │
│ │ input    │ │ input    │ │ input    │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│ ☑ Out of stock  [Status ▼] [Search]    │
│                                          │
│ ─────────────────────────────────────── │
│ RESULTS (Full Width)                     │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Pharmacy 1 Results                 │   │
│ │ With full details displayed inline │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Pharmacy 2 Results                 │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

## Interactive States

### Form Input States

```
NORMAL STATE:
┌─────────────────────────────────┐
│ e.g., Paracetamol              │  ← Light border
└─────────────────────────────────┘

FOCUS STATE:
┌─────────────────────────────────┐
│ Enter medicine name             │  ← Blue border + blue ring
└─────────────────────────────────┘

DISABLED STATE:
┌─────────────────────────────────┐
│ (Searching...)                  │  ← Gray, opacity 50%
└─────────────────────────────────┘

ERROR STATE:
┌─────────────────────────────────┐
│ (Invalid)                       │  ← Red border
└─────────────────────────────────┘
```

### Button States

```
DEFAULT:
[🔍 Search Medicines]  ← Blue background, white text

HOVER:
[🔍 Search Medicines]  ← Darker blue

ACTIVE:
[🔍 Search Medicines]  ← Even darker blue

DISABLED:
[🔍 Searching...]      ← Gray, spinner animation
```

### Status Badge States

```
IN_STOCK:
┌──────────────────┐
│ ✓ In Stock       │  ← Green (#10B981)
└──────────────────┘

LOW:
┌──────────────────┐
│ ⚠ Low Stock      │  ← Yellow (#FBBF24)
└──────────────────┘

OUT:
┌──────────────────┐
│ ✗ Out of Stock   │  ← Red (#EF4444)
└──────────────────┘
```

---

## Error & Success States

### Error Banner

```
┌─────────────────────────────────────────┐
│ ⚠ Search Error                          │
│ Please enter a medicine name to search  │
└─────────────────────────────────────────┘
  ↑ Light red background with red border
```

### Empty State (No Search Yet)

```
┌─────────────────────────────────────────┐
│                                         │
│           🔍                            │
│                                         │
│      Start Your Search                  │
│                                         │
│  Enter a medicine name and optional     │
│  filters to find nearby pharmacies      │
│  with the medicine in stock.            │
│                                         │
└─────────────────────────────────────────┘
```

### No Results State

```
┌─────────────────────────────────────────┐
│                                         │
│           ⚠                             │
│                                         │
│      No Results Found                   │
│                                         │
│  We couldn't find any pharmacies with   │
│  the medicine you're looking for.       │
│  Try adjusting your search filters or   │
│  search for an alternative medicine.    │
│                                         │
└─────────────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────────────┐
│  [⏳ Searching...]                       │
└─────────────────────────────────────────┘
  ↑ Spinner animation (rotating circle)
```

---

## Icon Usage

```
Navigation & Headers:
  🔍 Search      - Search functionality
  📦 Package     - Logo/branding
  🏥 Home        - Navigate home

Contact & Location:
  📞 Phone       - Clickable phone links
  ✉️ Email       - Clickable email links
  📍 Map Pin     - Address/location info
  🕐 Clock       - Opening hours
  🚚 Truck       - Delivery available

Medicine & Stock:
  💊 Pill        - Medicine indicator
  ✓ Checkmark    - In stock
  ⚠ Warning      - Low stock
  ✗ X Mark       - Out of stock

Status & Feedback:
  ⏳ Loader       - Loading state
  ⚠ Alert        - Warning/error
  ℹ Info         - Information
```

---

## Typography Scale

```
Page Title:        48px - 64px (text-4xl to text-6xl)
Section Heading:   24px - 32px (text-xl to text-2xl)
Card Title:        20px - 24px (text-lg to text-xl)
Body Text:         16px (base)
Small Text:        12px - 14px (text-sm to text-xs)
```

---

## Spacing Guide

```
Padding (px):
  sm: 4px
  md: 8px  
  lg: 16px
  xl: 24px
  2xl: 32px

Margins (px):
  Between sections: 32px
  Between cards:    16px
  Inside cards:     24px

Gap (flex/grid):
  Horizontal gap:   16px
  Vertical gap:     24px
```

---

## Animation & Transitions

```
Hover effects:
  Transition time: 300ms
  Easing: ease-in-out
  Effects: opacity, scale, translate

Loading spinner:
  Animation: rotate 360°
  Duration: 1s
  Iteration: infinite

Focus states:
  Outline: 3px ring
  Color: primary blue with opacity
```

---

## Accessibility Features

```
Visual:
  ✓ High contrast ratios (4.5:1+)
  ✓ Color not only indicator
  ✓ Large touch targets (44px min)
  ✓ Clear focus indicators

Keyboard:
  ✓ Tab navigation order
  ✓ Enter to submit forms
  ✓ Escape to close modals

Screen Reader:
  ✓ Semantic HTML
  ✓ ARIA labels
  ✓ Image alt text
  ✓ Form labels
```

---

## Print Styles

```
(If printing is needed in future)

Hide:
  - Navigation header
  - Search form
  - Contact buttons

Show:
  - Pharmacy name & address
  - Available medicines
  - Quantity & expiry info
```

---

## Dark Mode Ready

```
(Not implemented yet, but structure supports it)

Dark mode colors would use:
  Background:    #1F2937
  Text:          #F3F4F6
  Cards:         #111827
  Primary:       #3B82F6 (same)
  Success:       #10B981 (adjusted)
```

---

**Last Updated**: December 6, 2025  
**Status**: Complete & Production Ready  
**Accessibility**: WCAG 2.1 Level AA
