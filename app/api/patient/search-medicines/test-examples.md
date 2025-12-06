# Testing Examples for Search Medicines API

This document provides examples and utilities for testing the `/api/patient/search-medicines` endpoint.

## Manual Testing with cURL

### 1. Basic Search

```bash
curl "http://localhost:3000/api/patient/search-medicines?medicine=Paracetamol"
```

### 2. Search with City Filter

```bash
curl "http://localhost:3000/api/patient/search-medicines?medicine=Aspirin&city=Beirut"
```

### 3. Search with Multiple Filters

```bash
curl "http://localhost:3000/api/patient/search-medicines?medicine=Insulin&city=Tripoli&status=IN_STOCK"
```

### 4. Include Out of Stock

```bash
curl "http://localhost:3000/api/patient/search-medicines?medicine=Metformin&includeOutOfStock=true"
```

### 5. Invalid Request (Missing Medicine)

```bash
curl "http://localhost:3000/api/patient/search-medicines"
```

Expected: `400 Bad Request` with error message

## Testing with Postman

### Setup Collection

1. **Collection Name:** DawaLocate - Patient APIs
2. **Base URL:** `{{baseUrl}}/api/patient`
3. **Environment Variables:**
   - `baseUrl`: `http://localhost:3000`

### Test Cases

#### Test 1: Valid Search - In Stock Only

```
GET {{baseUrl}}/api/patient/search-medicines
Params:
  - medicine: Paracetamol
  - status: IN_STOCK

Tests:
- Status code is 200
- Response has success: true
- Response has data.results array
```

#### Test 2: Search by City

```
GET {{baseUrl}}/api/patient/search-medicines
Params:
  - medicine: Aspirin
  - city: Beirut

Tests:
- Status code is 200
- All results have pharmacy.city containing "Beirut"
```

#### Test 3: Invalid Medicine Name

```
GET {{baseUrl}}/api/patient/search-medicines
Params:
  - medicine: (empty)

Tests:
- Status code is 400
- Response has success: false
- Response has error message
```

## Jest Unit Tests

### Test File: `route.test.ts`

```typescript
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    medicine: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

import { db } from '@/lib/db';

describe('GET /api/patient/search-medicines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if medicine parameter is missing', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  it('should return empty results if no medicines match', async () => {
    (db.medicine.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=NonExistent')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(0);
    expect(data.data.medicines).toEqual([]);
  });

  it('should search by medicine name case-insensitively', async () => {
    const mockMedicines = [
      {
        id: 1,
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        strength: '500mg',
        form: 'Tablet',
      },
    ];

    const mockPharmacies = [
      {
        id: 1,
        name: 'Test Pharmacy',
        email: 'test@pharmacy.com',
        phone: '123456789',
        address: '123 Main St',
        city: 'Beirut',
        openingHours: '9 AM - 9 PM',
        hasDelivery: true,
        pharmacyMedicines: [
          {
            id: 1,
            status: 'IN_STOCK',
            quantity: 50,
            expiresAt: null,
            updatedAt: new Date(),
            medicine: mockMedicines[0],
          },
        ],
      },
    ];

    (db.medicine.findMany as jest.Mock).mockResolvedValue(mockMedicines);
    (db.user.findMany as jest.Mock).mockResolvedValue(mockPharmacies);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=paracetamol')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(1);
    expect(db.medicine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                contains: 'paracetamol',
                mode: 'insensitive',
              }),
            }),
          ]),
        }),
      })
    );
  });

  it('should filter pharmacies by city', async () => {
    const mockMedicines = [{ id: 1, name: 'Aspirin' }];

    (db.medicine.findMany as jest.Mock).mockResolvedValue(mockMedicines);
    (db.user.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=Aspirin&city=Beirut')
    );

    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          city: expect.objectContaining({
            contains: 'Beirut',
            mode: 'insensitive',
          }),
        }),
      })
    );
  });

  it('should filter by inventory status', async () => {
    const mockMedicines = [{ id: 1, name: 'Insulin' }];

    (db.medicine.findMany as jest.Mock).mockResolvedValue(mockMedicines);
    (db.user.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=Insulin&status=IN_STOCK')
    );

    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pharmacyMedicines: expect.objectContaining({
            some: expect.objectContaining({
              status: expect.objectContaining({
                in: ['IN_STOCK'],
              }),
            }),
          }),
        }),
      })
    );
  });

  it('should only return approved pharmacies', async () => {
    const mockMedicines = [{ id: 1, name: 'Metformin' }];

    (db.medicine.findMany as jest.Mock).mockResolvedValue(mockMedicines);
    (db.user.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=Metformin')
    );

    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
          userType: expect.objectContaining({
            name: 'pharmacy',
          }),
        }),
      })
    );
  });

  it('should handle database errors gracefully', async () => {
    (db.medicine.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=Test')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeTruthy();
  });
});
```

## Integration Tests

### Test File: `route.integration.test.ts`

```typescript
import { NextRequest } from 'next/server';
import { GET } from './route';
import { db } from '@/lib/db';

/**
 * Integration tests require a test database
 * Run with: npm test -- --testPathPattern=integration
 */

describe('Search Medicines Integration Tests', () => {
  let testMedicineId: number;
  let testPharmacyId: number;

  beforeAll(async () => {
    // Setup test data
    const medicine = await db.medicine.create({
      data: {
        name: 'Test Paracetamol',
        genericName: 'Acetaminophen',
        strength: '500mg',
        form: 'Tablet',
      },
    });
    testMedicineId = medicine.id;

    const userType = await db.userType.findFirst({
      where: { name: 'pharmacy' },
    });

    const pharmacy = await db.user.create({
      data: {
        name: 'Test Pharmacy',
        email: 'test-pharmacy@example.com',
        passwordHash: 'hashed',
        userTypeId: userType!.id,
        city: 'Test City',
        phone: '123456789',
        status: 'APPROVED',
      },
    });
    testPharmacyId = pharmacy.id;

    await db.pharmacyMedicine.create({
      data: {
        pharmacyId: testPharmacyId,
        medicineId: testMedicineId,
        status: 'IN_STOCK',
        quantity: 100,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.pharmacyMedicine.deleteMany({
      where: { pharmacyId: testPharmacyId },
    });
    await db.user.delete({
      where: { id: testPharmacyId },
    });
    await db.medicine.delete({
      where: { id: testMedicineId },
    });
  });

  it('should find pharmacy with medicine in stock', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=Test Paracetamol')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBeGreaterThan(0);
    
    const result = data.data.results[0];
    expect(result.pharmacy.name).toBe('Test Pharmacy');
    expect(result.medicines[0].medicine.name).toBe('Test Paracetamol');
    expect(result.medicines[0].availability.status).toBe('IN_STOCK');
  });

  it('should filter by city correctly', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/patient/search-medicines?medicine=Test Paracetamol&city=Test City')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.total).toBeGreaterThan(0);
    
    data.data.results.forEach((result: any) => {
      expect(result.pharmacy.city).toContain('Test City');
    });
  });
});
```

## Performance Testing

### Load Test with Artillery

Create `artillery-config.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Search medicines"
    flow:
      - get:
          url: "/api/patient/search-medicines?medicine=Paracetamol"
          expect:
            - statusCode: 200
            - contentType: json
      - think: 2
      - get:
          url: "/api/patient/search-medicines?medicine=Aspirin&city=Beirut"
          expect:
            - statusCode: 200
```

Run with: `artillery run artillery-config.yml`

## Test Checklist

- [ ] Valid search returns 200
- [ ] Missing medicine parameter returns 400
- [ ] Empty medicine parameter returns 400
- [ ] Case-insensitive search works
- [ ] City filter works
- [ ] Pharmacy name filter works
- [ ] Status filter works
- [ ] Include out of stock works
- [ ] Only approved pharmacies returned
- [ ] Results grouped by city correctly
- [ ] Database errors handled gracefully
- [ ] Response format matches types
- [ ] Performance acceptable (<500ms for typical query)
- [ ] No SQL injection vulnerabilities
- [ ] Proper indexes used in queries

## Debugging Tips

### Enable Query Logging

In development, check terminal for Prisma query logs to see actual SQL being executed.

### Check Database

```sql
-- Check if medicines exist
SELECT * FROM medicines WHERE name ILIKE '%paracetamol%';

-- Check pharmacy medicines
SELECT 
  u.name as pharmacy_name,
  m.name as medicine_name,
  pm.status,
  pm.quantity
FROM pharmacy_medicines pm
JOIN users u ON pm.pharmacy_id = u.id
JOIN medicines m ON pm.medicine_id = m.id
WHERE u.status = 'APPROVED';
```

### Common Issues

1. **No results found**
   - Verify medicines exist in database
   - Check pharmacy status is APPROVED
   - Verify pharmacy_medicines inventory status
   - Check city name spelling

2. **Slow queries**
   - Ensure indexes exist on foreign keys
   - Check EXPLAIN ANALYZE on the query
   - Consider pagination for large result sets

3. **Type errors**
   - Regenerate Prisma client: `npx prisma generate`
   - Check import paths for types

