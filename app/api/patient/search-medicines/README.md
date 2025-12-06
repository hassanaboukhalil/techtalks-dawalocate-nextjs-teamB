# Search Medicines API Endpoint

## Overview

The `/api/patient/search-medicines` endpoint allows patients to search for pharmacies that have specific medicines in stock. It provides flexible search capabilities with multiple filtering options.

## Endpoint

```
GET /api/patient/search-medicines
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `medicine` | string | **Yes** | Medicine name to search for. Searches in medicine name, generic name, and synonyms (case-insensitive) |
| `city` | string | No | Filter pharmacies by city (case-insensitive partial match) |
| `name` | string | No | Filter pharmacies by name (case-insensitive partial match) |
| `status` | string | No | Filter by inventory status. Comma-separated values: `IN_STOCK`, `LOW`, `OUT`. Default: `IN_STOCK,LOW` |
| `includeOutOfStock` | boolean | No | Include out-of-stock items. Default: `false` |

## Response Format

### Success Response (200)

```typescript
{
  "success": true,
  "data": {
    "searchTerm": string,
    "matchingMedicines": Array<{
      "id": number,
      "name": string,
      "genericName": string | null,
      "strength": string | null,
      "form": string | null,
      "description": string | null,
      "imageUrl": string | null
    }>,
    "results": Array<{
      "pharmacy": {
        "id": number,
        "name": string,
        "email": string,
        "phone": string | null,
        "address": string | null,
        "city": string | null,
        "openingHours": string | null,
        "hasDelivery": boolean | null
      },
      "medicines": Array<{
        "inventoryId": number,
        "medicine": {
          "id": number,
          "name": string,
          "genericName": string | null,
          "strength": string | null,
          "form": string | null,
          "description": string | null,
          "imageUrl": string | null
        },
        "availability": {
          "status": "IN_STOCK" | "LOW" | "OUT",
          "quantity": number,
          "expiresAt": string | null,
          "lastUpdated": string
        }
      }>
    }>,
    "resultsByCity": {
      [cityName: string]: Array<PharmacyResult>
    },
    "total": number,
    "filters": {
      "city": string | null,
      "pharmacyName": string | null,
      "status": Array<"IN_STOCK" | "LOW" | "OUT">
    },
    "message": string
  }
}
```

### Error Response (400/500)

```typescript
{
  "success": false,
  "error": string,
  "message"?: string,
  "details"?: string  // Only in development mode
}
```

## Usage Examples

### 1. Basic Medicine Search

Search for any pharmacy that has Paracetamol in stock:

```bash
GET /api/patient/search-medicines?medicine=Paracetamol
```

**JavaScript/TypeScript:**

```typescript
import axios from 'axios';

const searchMedicine = async (medicineName: string) => {
  const response = await axios.get('/api/patient/search-medicines', {
    params: { medicine: medicineName }
  });
  return response.data;
};

const results = await searchMedicine('Paracetamol');
console.log(`Found ${results.data.total} pharmacies`);
```

### 2. Search with City Filter

Find pharmacies in Beirut that have Aspirin:

```bash
GET /api/patient/search-medicines?medicine=Aspirin&city=Beirut
```

**JavaScript/TypeScript:**

```typescript
const response = await axios.get('/api/patient/search-medicines', {
  params: {
    medicine: 'Aspirin',
    city: 'Beirut'
  }
});

// Results are grouped by city for easy navigation
const beirutPharmacies = response.data.data.resultsByCity['Beirut'];
```

### 3. Search Specific Pharmacy

Look for a medicine in pharmacies matching a name pattern:

```bash
GET /api/patient/search-medicines?medicine=Insulin&name=Central
```

**JavaScript/TypeScript:**

```typescript
const response = await axios.get('/api/patient/search-medicines', {
  params: {
    medicine: 'Insulin',
    name: 'Central'  // Matches "Central Pharmacy", "Al Central", etc.
  }
});
```

### 4. Filter by Availability Status

Only show pharmacies with medicine IN_STOCK:

```bash
GET /api/patient/search-medicines?medicine=Metformin&status=IN_STOCK
```

**JavaScript/TypeScript:**

```typescript
const response = await axios.get('/api/patient/search-medicines', {
  params: {
    medicine: 'Metformin',
    status: 'IN_STOCK'
  }
});
```

### 5. Multiple Status Filters

Show pharmacies with IN_STOCK or LOW availability:

```bash
GET /api/patient/search-medicines?medicine=Amoxicillin&status=IN_STOCK,LOW
```

### 6. Include Out of Stock

Show all pharmacies, even those with OUT status:

```bash
GET /api/patient/search-medicines?medicine=Vitamin D&includeOutOfStock=true
```

### 7. Complex Combined Query

Find a specific medicine in a city with delivery options:

```bash
GET /api/patient/search-medicines?medicine=Lisinopril&city=Tripoli&status=IN_STOCK
```

**JavaScript/TypeScript:**

```typescript
const response = await axios.get('/api/patient/search-medicines', {
  params: {
    medicine: 'Lisinopril',
    city: 'Tripoli',
    status: 'IN_STOCK'
  }
});

// Filter results to only show pharmacies with delivery
const withDelivery = response.data.data.results.filter(
  result => result.pharmacy.hasDelivery
);
```

## React Component Example

```typescript
import { useState } from 'react';
import axios from 'axios';
import type { SearchMedicinesResponse } from './types';

export function MedicineSearch() {
  const [medicine, setMedicine] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<SearchMedicinesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<SearchMedicinesResponse>(
        '/api/patient/search-medicines',
        {
          params: {
            medicine,
            city: city || undefined,
          }
        }
      );

      setResults(response.data);
    } catch (err) {
      setError('Failed to search for medicines');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={medicine}
          onChange={(e) => setMedicine(e.target.value)}
          placeholder="Enter medicine name"
          required
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (optional)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {results && results.success && (
        <div>
          <h3>{results.data.message}</h3>
          <p>Found {results.data.total} pharmacies</p>
          
          {results.data.results.map((result) => (
            <div key={result.pharmacy.id}>
              <h4>{result.pharmacy.name}</h4>
              <p>{result.pharmacy.address}, {result.pharmacy.city}</p>
              <p>Phone: {result.pharmacy.phone}</p>
              {result.pharmacy.hasDelivery && <span>🚚 Delivery Available</span>}
              
              <ul>
                {result.medicines.map((med) => (
                  <li key={med.inventoryId}>
                    {med.medicine.name} - {med.availability.status}
                    {med.availability.quantity > 0 && (
                      <span> (Qty: {med.availability.quantity})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Features

### 🔍 Smart Search
- Searches in medicine name, generic name, and synonyms
- Case-insensitive matching
- Partial string matching for flexible queries

### 🏥 Pharmacy Filtering
- Filter by city
- Filter by pharmacy name
- Only shows approved pharmacies

### 📦 Inventory Status
- Customizable status filters
- Default shows IN_STOCK and LOW
- Option to include OUT items

### 📊 Organized Results
- Results grouped by city
- Sorted by city then pharmacy name
- Includes availability details (quantity, expiry)

### 🚚 Delivery Information
- Shows which pharmacies offer delivery
- Includes opening hours
- Full contact information

## Error Handling

The endpoint handles various error scenarios:

- **400 Bad Request**: Missing or invalid medicine parameter
- **500 Internal Server Error**: Database or server errors

In development mode, detailed error information is included in the response.

## Performance Considerations

- Database queries are optimized with proper indexes
- Results are limited to approved pharmacies only
- Efficient joins minimize database round trips
- Case-insensitive searches use database-level operations

## Security

- Only returns data from approved pharmacies
- No authentication required (public search)
- Input sanitization via Prisma parameterized queries
- No sensitive data exposed

## Type Safety

Import types from `types.ts` for full TypeScript support:

```typescript
import type {
  SearchMedicinesParams,
  SearchMedicinesResponse,
  PharmacySearchResult,
  MedicineAvailability
} from './types';
```

## Related Endpoints

- `GET /api/medicines` - Get all medicines in the catalog
- `GET /api/pharmacy/inventory` - View pharmacy inventory (pharmacy role)
- `POST /api/patient/requests` - Create a medicine request

## Future Enhancements

- [ ] Distance-based sorting (requires geolocation)
- [ ] Price comparison (requires price data)
- [ ] Real-time availability updates
- [ ] Favorite pharmacies
- [ ] Medicine alternatives suggestions
- [ ] Pagination for large result sets

