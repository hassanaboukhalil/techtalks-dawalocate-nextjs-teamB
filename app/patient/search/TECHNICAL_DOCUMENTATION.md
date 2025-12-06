# Patient Search Page - Technical Documentation

## Architecture Overview

### Component Type: Client Component (`'use client'`)

The patient search page is a client component because it requires:
- Real-time form state management
- User interactions and event handling
- Dynamic API calls based on form inputs
- Immediate UI updates without page reloads

```typescript
'use client';  // Enables client-side interactivity

import React, { useState, useCallback } from 'react';
// ... rest of imports
```

## State Management Pattern

### Custom State Pattern (No Redux/Context needed)

```typescript
interface SearchParams {
  medicine: string;
  city: string;
  pharmacyName: string;
  status: string;
  includeOutOfStock: boolean;
}

const [searchParams, setSearchParams] = useState<SearchParams>({
  medicine: '',
  city: '',
  pharmacyName: '',
  status: 'IN_STOCK,LOW',
  includeOutOfStock: false,
});

const [results, setResults] = useState<PharmacyResult[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [hasSearched, setHasSearched] = useState(false);
```

**Why this approach?**
- Simple and predictable
- Minimal dependencies
- Easy to debug
- Sufficient for current use case

## Key Functions

### 1. **handleInputChange** (Memoized for Performance)

```typescript
const handleInputChange = useCallback(
  (field: keyof SearchParams, value: string | boolean) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);  // Clear error when user modifies search
  },
  []  // No dependencies = memoized once
);
```

**Benefits:**
- ✅ Prevents unnecessary re-renders
- ✅ Type-safe field updates
- ✅ Automatically clears errors when user modifies input

### 2. **performSearch** (Async API Call)

```typescript
const performSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  setHasSearched(true);

  try {
    // Validate required input
    if (!searchParams.medicine.trim()) {
      setError('Please enter a medicine name to search');
      setIsLoading(false);
      return;
    }

    // Build query parameters dynamically
    const queryParams = new URLSearchParams({
      medicine: searchParams.medicine,
      ...(searchParams.city && { city: searchParams.city }),
      ...(searchParams.pharmacyName && { name: searchParams.pharmacyName }),
      status: searchParams.status,
      includeOutOfStock: String(searchParams.includeOutOfStock),
    });

    // Make API call
    const response = await fetch(
      `/api/patient/search-medicines?${queryParams.toString()}`
    );

    const data: SearchResponse = await response.json();

    // Check response success
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to search medicines');
    }

    // Update results
    setResults(data.data?.results || []);
    setMatchingMedicines(data.data?.matchingMedicines || []);
    setTotalResults(data.data?.total || 0);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred during search';
    setError(errorMessage);
    setResults([]);
  } finally {
    setIsLoading(false);
  }
};
```

**Error Handling Strategy:**
- ✅ Client-side validation first
- ✅ Network error detection
- ✅ API response error handling
- ✅ User-friendly error messages
- ✅ State reset on error

## Type Safety

### Complete TypeScript Interfaces

```typescript
// Search form state
interface SearchParams {
  medicine: string;
  city: string;
  pharmacyName: string;
  status: string;
  includeOutOfStock: boolean;
}

// Medicine information
interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  description: string | null;
  imageUrl: string | null;
}

// Stock availability
interface AvailabilityInfo {
  status: 'IN_STOCK' | 'LOW' | 'OUT';
  quantity: number;
  expiresAt: string | null;
  lastUpdated: string;
}

// Pharmacy information
interface Pharmacy {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
}

// Inventory item with medicine details
interface PharmacyMedicine {
  inventoryId: number;
  medicine: Medicine;
  availability: AvailabilityInfo;
}

// Complete result set
interface PharmacyResult {
  pharmacy: Pharmacy;
  medicines: PharmacyMedicine[];
}

// API response format
interface SearchResponse {
  success: boolean;
  data?: {
    searchTerm: string;
    matchingMedicines: Medicine[];
    results: PharmacyResult[];
    resultsByCity: Record<string, PharmacyResult[]>;
    total: number;
    filters: {
      city: string | null;
      pharmacyName: string | null;
      status: string[];
    };
    message: string;
  };
  error?: string;
}
```

## Utility Functions

### Status Badge Styling

```typescript
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'IN_STOCK':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'LOW':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'OUT':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
```

### Date Formatting

```typescript
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

## UI Patterns

### 1. **Conditional Rendering Pattern**

```typescript
{hasSearched && !isLoading && (
  <>
    {totalResults > 0 ? (
      // Show results
      <div className="space-y-4">
        {results.map((result) => (
          // Result card
        ))}
      </div>
    ) : (
      // Show no results state
      <div className="text-center py-12">
        {/* ... */}
      </div>
    )}
  </>
)}
```

### 2. **Loading State Pattern**

```typescript
<Button
  type="submit"
  disabled={isLoading || !searchParams.medicine.trim()}
  className="w-full sm:w-auto gap-2"
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Searching...
    </>
  ) : (
    <>
      <Search className="h-4 w-4" />
      Search Medicines
    </>
  )}
</Button>
```

### 3. **Error Display Pattern**

```typescript
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="font-semibold text-red-900">Search Error</h3>
      <p className="text-sm text-red-700 mt-1">{error}</p>
    </div>
  </div>
)}
```

## Responsive Design Patterns

### Mobile-First Approach

```typescript
{/* Form layout - stacks on mobile, grid on larger screens */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>{/* City Filter */}</div>
  <div>{/* Pharmacy Filter */}</div>
  <div>{/* Status Filter */}</div>
</div>

{/* Results detail layout */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
  <div>{/* Quantity */}</div>
  <div>{/* Expires */}</div>
  <div className="col-span-2 sm:col-span-2">{/* Last Updated */}</div>
</div>
```

## Accessibility Patterns

### Form Accessibility

```typescript
{/* Required field indicator */}
<label htmlFor="medicine" className="block text-sm font-medium text-gray-700">
  Medicine Name <span className="text-red-500">*</span>
</label>

{/* Input with proper attributes */}
<Input
  id="medicine"
  type="text"
  placeholder="e.g., Paracetamol, Aspirin, Ibuprofen"
  value={searchParams.medicine}
  onChange={(e) => handleInputChange('medicine', e.target.value)}
  disabled={isLoading}
  className="w-full"
/>
```

### Interactive Elements

```typescript
{/* Disabled state during loading */}
<Input
  disabled={isLoading}
/>

{/* Proper semantic button */}
<Button
  type="submit"
  disabled={isLoading || !searchParams.medicine.trim()}
>
  {/* ... */}
</Button>
```

## Performance Optimization

### 1. **Memoized Callbacks**
Used `useCallback` to prevent unnecessary re-renders of child components.

### 2. **Efficient State Updates**
Updates only the specific form field instead of replacing entire state object.

### 3. **Conditional Rendering**
Only renders results section after search is performed.

### 4. **Type Safety**
Prevents runtime errors and improves IDE autocomplete/suggestions.

## Future Enhancements

### 1. **Debounce Search Input**
```typescript
const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

const handleMedicineChange = (value: string) => {
  handleInputChange('medicine', value);
  
  // Debounce API call
  if (searchTimeout) clearTimeout(searchTimeout);
  setSearchTimeout(
    setTimeout(() => performSearch(), 300)
  );
};
```

### 2. **Save Search History**
```typescript
const [searchHistory, setSearchHistory] = useState<string[]>(() => {
  const saved = localStorage.getItem('searchHistory');
  return saved ? JSON.parse(saved) : [];
});

// After successful search:
const newHistory = [searchParams.medicine, ...searchHistory].slice(0, 5);
localStorage.setItem('searchHistory', JSON.stringify(newHistory));
setSearchHistory(newHistory);
```

### 3. **Favorites System**
```typescript
interface FavoritePharmacy {
  pharmacyId: number;
  addedAt: Date;
}

const [favorites, setFavorites] = useState<FavoritePharmacy[]>(() => {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
});

const toggleFavorite = (pharmacyId: number) => {
  setFavorites((prev) =>
    prev.some(f => f.pharmacyId === pharmacyId)
      ? prev.filter(f => f.pharmacyId !== pharmacyId)
      : [...prev, { pharmacyId, addedAt: new Date() }]
  );
};
```

## Testing Recommendations

### Unit Tests

```typescript
describe('PatientSearchPage', () => {
  it('should handle search with valid medicine name', async () => {
    // Test search functionality
  });

  it('should show error for empty medicine name', async () => {
    // Test validation
  });

  it('should format dates correctly', () => {
    expect(formatDate('2025-12-25')).toBe('Dec 25, 2025');
  });

  it('should apply correct status badge styles', () => {
    expect(getStatusBadgeStyle('IN_STOCK')).toContain('green');
  });
});
```

### Integration Tests

```typescript
describe('API Integration', () => {
  it('should fetch and display search results', async () => {
    // Mock API call and test complete flow
  });

  it('should handle API errors gracefully', async () => {
    // Test error handling
  });
});
```

---

**Last Updated**: December 6, 2025
**Version**: 1.0.0
**Maintainer**: Development Team
