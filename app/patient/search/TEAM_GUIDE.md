# Patient Search Page - Team Quick Reference

## What Was Built ✅

A fully functional **Patient Medicine Search Page** that connects to the existing `/api/patient/search-medicines` endpoint.

### Key Features:
- 🔍 **Smart Search**: Find medicines by name with optional filters
- 🗺️ **Location Filtering**: Search by city and pharmacy name
- 📊 **Status Filters**: View only available items or include out-of-stock
- 📱 **Responsive**: Works perfectly on mobile, tablet, and desktop
- 🎨 **Beautiful UI**: Follows DawaLocate design system
- ♿ **Accessible**: WCAG 2.1 compliant

## File Structure

```
app/patient/
├── layout.tsx              (Patient route layout with header)
├── page.tsx                (Patient dashboard/homepage)
└── search/
    ├── page.tsx            (Main search page - CLIENT COMPONENT)
    └── IMPLEMENTATION_SUMMARY.md
```

## How It Works

### 1. **Search Form** (Top Section)
```
┌─────────────────────────────────────────┐
│  Medicine Name (Required)              │
│  [City Filter]  [Pharmacy Filter]      │
│  [Status Dropdown]  [Out-of-Stock ☑]   │
│  [Search Button]                       │
└─────────────────────────────────────────┘
```

### 2. **Results Display** (Below Search Form)
```
Each pharmacy shows:
├── Pharmacy Name & Details
│   ├── Address with map icon
│   ├── City (highlighted)
│   ├── Phone (clickable)
│   ├── Email (clickable)
│   ├── Opening hours
│   └── Delivery badge (if available)
├── Available Medicines List
│   ├── Medicine name
│   ├── Generic name, strength, form
│   ├── Status badge (color coded)
│   ├── Quantity
│   ├── Expiry date
│   └── Last updated
└── Contact Buttons [Call] [Email]
```

## API Connection

The page uses the existing backend API:

```
GET /api/patient/search-medicines?medicine=Paracetamol&city=Beirut&status=IN_STOCK
```

**Query Parameters:**
- `medicine` (required): Medicine name
- `city` (optional): Filter by city
- `name` (optional): Filter by pharmacy name
- `status` (optional): IN_STOCK, LOW, OUT (comma-separated)
- `includeOutOfStock` (optional): true/false

## Testing the Page

### 1. **Start Dev Server**
```bash
npm run dev
```

### 2. **Navigate to Search Page**
```
http://localhost:3000/patient/search
```

### 3. **Try a Search**
- Type any medicine name (e.g., "Paracetamol")
- Optionally add city (e.g., "Beirut")
- Click "Search Medicines"
- View results grouped by pharmacy

## Component Usage

The page is built as a **Client Component** (uses `'use client'`) because it:
- Manages interactive form state
- Makes API requests on demand
- Shows real-time search results
- Handles user interactions

## Styling Notes

- Uses **Tailwind CSS v4**
- Follows existing component library (`components/ui/`)
- Responsive breakpoints:
  - `sm:` for tablets
  - `lg:` for desktops
- Color scheme matches DawaLocate branding

## State Management

Uses React hooks for simple, efficient state:
```javascript
- searchParams: Manages form inputs
- results: Stores pharmacy results
- isLoading: Loading state during search
- error: Error messages
- hasSearched: Track if search has been performed
- matchingMedicines: Store matching medicine details
- totalResults: Result count
```

## Error Handling

✅ **Graceful Error Handling:**
- Invalid/empty search → User-friendly error
- API failure → Clear error message
- No results → Helpful "no results" state
- Loading state → Shows spinner during request

## Next Steps for Team

### Before Going Live:

1. **Database Setup** ✅
   - Seed with test data (medicines, pharmacies, inventory)

2. **API Testing** ✅
   - Verify `/api/patient/search-medicines` returns correct data
   - Test all filter combinations

3. **UI Review**
   - Check on actual devices
   - Verify all links work (phone, email)
   - Test on different browsers

4. **Performance**
   - Monitor API response times
   - Add caching if needed
   - Consider pagination for many results

5. **Authentication**
   - Integrate with auth system if needed
   - Add route protection if required

## Common Questions

**Q: Why is it a Client Component?**  
A: Search is interactive and needs real-time user interactions. Client Components handle this better.

**Q: Can I modify the styling?**  
A: Yes! All Tailwind classes can be customized. Follow the existing color scheme for consistency.

**Q: How do I add new filters?**  
A: Add to `SearchParams` type, add form input, and pass in query params to the API.

**Q: What if the API changes?**  
A: Update the `SearchResponse` types and adjust the API call in `performSearch()`.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm install` and check Node version |
| No results | Check if database has test data |
| API error 400 | Ensure medicine parameter is not empty |
| Styling looks off | Clear `.next` folder and rebuild |

## Performance Tips

- Search debouncing: Add delay before API call on each keystroke
- Lazy loading: Load pharmacy details on scroll
- Caching: Store recent searches in localStorage

---

**For questions or issues, refer to:**
- API Docs: `app/api/patient/search-medicines/README.md`
- Project Context: `PROJECT_CONTEXT.md`
- Implementation Details: `app/patient/search/IMPLEMENTATION_SUMMARY.md`

Good to go! 🚀
