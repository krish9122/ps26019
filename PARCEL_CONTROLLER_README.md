# Parcel Controller Documentation (`parcelController.js`)

This document provides a comprehensive explanation of the implementation, architecture, and behavior of the **Parcel Controller** created for the **Bhu Drishti** backend.

---

## 1. Overview of Changes

The file [`src/controllers/parcelController.js`](file:///c:/Users/heykr/OneDrive/Desktop/Bhu-drishtri/bhu-drishtri_backend/src/controllers/parcelController.js) was created to handle all CRUD (Create, Read, Update, Delete) HTTP operations for land parcels in the Bhu Drishti platform.

### Key Objectives Achieved
* **Zero Boilerplate:** Controller functions do not contain repetitive `try/catch` blocks for general exceptions; promises are managed via the existing [`asyncHandlers`](file:///c:/Users/heykr/OneDrive/Desktop/Bhu-drishtri/bhu-drishtri_backend/src/utils/asyncHandler.js) utility.
* **Standardized Responses:** All successful endpoints return uniform JSON payloads via [`ApiResponse`](file:///c:/Users/heykr/OneDrive/Desktop/Bhu-drishtri/bhu-drishtri_backend/src/utils/ApiResponse.js).
* **Consistent Error Handling:** Known operational and validation errors throw [`ApiError`](file:///c:/Users/heykr/OneDrive/Desktop/Bhu-drishtri/bhu-drishtri_backend/src/utils/ApiError.js) with appropriate HTTP status codes (400, 404, 409).
* **Strict Parameter Whitelisting:** Prevents mass-assignment vulnerabilities and protects system-derived and immutable fields.
* **NoSQL Injection Defense:** Explicitly rejects raw MongoDB operators (e.g. `$set`, `$where`, `$push`).
* **GeoJSON Integrity:** Validates polygon/multipolygon geometries and `[longitude, latitude]` bounds before persisting.
* **Duplicate Identifier Protection:** Catches MongoDB `code: 11000` collisions and presents friendly HTTP 409 responses.

---

## 2. Architecture & Request Lifecycle

```text
HTTP Request
     │
     ▼
asyncHandlers (Wraps async function; forwards rejections to next(err))
     │
     ▼
parcelController
  ├── 1. NoSQL Operator Guard (Rejects keys starting with "$")
  ├── 2. ObjectId Validation (mongoose.isValidObjectId for params.id)
  ├── 3. GeoJSON Validation (Ensures Polygon / MultiPolygon validity)
  ├── 4. Payload Sanitization (Whitelists client-controllable fields)
  └── 5. Mongoose Operation (Parcel.create, find, findById, findByIdAndUpdate, findByIdAndDelete)
            │
            ▼
     Parcel Model (src/models/Parcel.js)
       ├── Schema validation (enums, min/max, required fields)
       └── pre("validate") hook (validates owner share <= 100%, calculates GIS area & centroid)
            │
            ▼
        MongoDB
            │
     ┌──────┴──────┐
     │             │
  Success        Error
     │             │
     ▼             ▼
ApiResponse     Catch block (if duplicate code 11000 -> ApiError 409)
(200 / 201)     or throw ApiError / rethrow
     │             │
     ▼             ▼
Express Client  Centralized Error Middleware (src/middleware/errorHandler.js)
```

---

## 3. Function Breakdown & How They Work

### 1. `createParcel`
* **Route:** `POST /api/parcels`
* **Workflow:**
  1. Calls `preventMongoOperators(req.body)` to ensure no `$where`, `$set`, etc. exist in the payload.
  2. If `req.body.geometry` is provided, calls `validateGeoJsonGeometry` to ensure it is a valid `Polygon` or `MultiPolygon` with coordinate points within `[-180, 180]` longitude and `[-90, 90]` latitude.
  3. Sanitizes `req.body` against `ALLOWED_PARCEL_FIELDS` to drop any unapproved or system fields.
  4. Calls `Parcel.create(parcelData)`. During this step:
     * Mongoose validates all schema rules (required fields like `parcelId`, `surveyNumber`, `recordedAreaSqm`, `landType`, `state`, etc.).
     * The `pre("validate")` hook automatically derives `gisAreaSqm`, `centroid`, and `areaDiscrepancySqm`.
     * The hook verifies that active co-owners' shares do not exceed 100.00%.
  5. Intercepts MongoDB duplicate key errors (`code: 11000` on `parcelId` or `ulpin`), logs the duplicate details to the console, and throws `new ApiError(409, "Parcel with this identifier already exists")`.
  6. Returns `res.status(201).json(new ApiResponse(201, parcel, "Parcel created successfully"))`.

### 2. `getAllParcels`
* **Route:** `GET /api/parcels?page=1&limit=10`
* **Workflow:**
  1. Parses `req.query.page` (default `1`) and `req.query.limit` (default `10`).
  2. Enforces pagination constraints: invalid or non-numeric values fallback to defaults; `limit` is capped at a maximum of `100` to prevent denial-of-service memory pressure.
  3. Calculates the skip offset: `(page - 1) * limit`.
  4. Concurrently executes `Parcel.find().skip(skip).limit(limit)` and `Parcel.countDocuments()` using `Promise.all` for performance.
  5. Computes `totalPages = Math.ceil(total / limit)`.
  6. Returns `res.status(200).json(new ApiResponse(200, { parcels, pagination: { page, limit, total, totalPages } }, "Parcels fetched successfully"))`.

### 3. `getParcelById`
* **Route:** `GET /api/parcels/:id`
* **Workflow:**
  1. Validates `req.params.id` using `mongoose.isValidObjectId(id)`. If invalid, throws `new ApiError(400, "Invalid parcel ID")`.
  2. Queries `Parcel.findById(id)`.
  3. If no document is found, throws `new ApiError(404, "Parcel not found")`.
  4. Returns `res.status(200).json(new ApiResponse(200, parcel, "Parcel fetched successfully"))`.

### 4. `updateParcel`
* **Route:** `PUT /api/parcels/:id`
* **Workflow:**
  1. Validates `req.params.id` using `mongoose.isValidObjectId(id)` -> throws `ApiError(400)` if invalid.
  2. Finds the document via `Parcel.findById(id)` -> throws `ApiError(404)` if not found.
  3. Calls `preventMongoOperators(req.body)` to reject NoSQL operators.
  4. Validates GeoJSON geometry (closed rings, coordinate bounds) if present in update payload.
  5. Sanitizes updates against `ALLOWED_PARCEL_FIELDS`.
  6. Applies updates using `Object.assign(parcel, updates)`.
  7. Calls `await parcel.save()`:
     * Triggers the Mongoose `pre("validate")` hook on the document.
     * Recalculates `gisAreaSqm`, `centroid`, `areaDiscrepancySqm`, and `areaDiscrepancyPercentage` if geometry or recorded area changes.
     * Verifies that total active co-ownership shares do not exceed 100.00%.
  8. Intercepts MongoDB duplicate key errors (`code: 11000` on `parcelId` or `ulpin`) and throws `ApiError(409, "Parcel with this identifier already exists")`.
  9. Returns `res.status(200).json(new ApiResponse(200, parcel, "Parcel updated successfully"))`.

### 5. `deleteParcel`
* **Route:** `DELETE /api/parcels/:id`
* **Workflow:**
  1. Validates `req.params.id` using `mongoose.isValidObjectId(id)` -> throws `ApiError(400)` if invalid.
  2. Executes `Parcel.findByIdAndDelete(id)`.
  3. If no document was deleted, throws `new ApiError(404, "Parcel not found")`.
  4. Returns `res.status(200).json(new ApiResponse(200, null, "Parcel deleted successfully"))`.

---

## 4. Field Whitelisting & Protection

To protect system integrity, fields are categorized into **client-controllable** and **system-controlled**:

| Field Category | Fields | Controller Treatment |
|---|---|---|
| **Cadastral Identifiers** | `parcelId`, `ulpin`, `surveyNumber`, `subDivisionNumber` | Allowed (unique checks applied) |
| **Area & Land Classification** | `recordedAreaSqm`, `areaUnit`, `landType`, `landUseCategory` | Allowed |
| **Location & Boundaries** | `state`, `district`, `subDistrict`, `village`, `pincode`, `centroid`, `geometry` | Allowed (GeoJSON validated) |
| **Relationships & Status** | `owners`, `legalCases`, `status`, `notes`, `metadata` | Allowed |
| **System-Derived Geodetics** | `gisAreaSqm`, `areaDiscrepancySqm`, `areaDiscrepancyPercentage` | **Excluded / Stripped** (derived by Mongoose hook) |
| **Database & Metadata** | `_id`, `createdAt`, `updatedAt`, `__v` | **Excluded / Stripped** (managed by Mongoose/MongoDB) |

---

## 5. Error Handling Details

```text
Type of Error                     HTTP Status  Error Response
─────────────────────────────────────────────────────────────────────────────
Malformed ObjectId                400          "Invalid parcel ID"
MongoDB Operator Injection ($set) 400          "Invalid field '$set'. MongoDB operators..."
Invalid GeoJSON Geometry          400          "Geometry type must be either 'Polygon'..."
Parcel Not Found                  404          "Parcel not found"
Duplicate parcelId or ulpin       409          "Parcel with this identifier already exists"
Mongoose Schema Validation Fail   500*         Validation error passed to error middleware
```

> **Note on Centralized Error Middleware:**  
> The current [`src/middleware/errorHandler.js`](file:///c:/Users/heykr/OneDrive/Desktop/Bhu-drishtri/bhu-drishtri_backend/src/middleware/errorHandler.js) reads `err.statusCode || 500`. It does not yet transform standard Mongoose `ValidationError` or `CastError` into formatted 400 responses. The controller intercepts duplicate keys (`code: 11000`) and converts them to HTTP 409, while standard schema validation errors flow cleanly through `asyncHandlers` to the centralized handler.

---

## 6. Verification & Testing

The controller was verified against live MongoDB Atlas connectivity:

```text
✓ MongoDB connection verified
✓ parcelController imports verified
✓ createParcel: 201 Created + auto-computed GIS Area (1174511.85 sqm)
✓ duplicate create: 409 Conflict ("Parcel with this identifier already exists")
✓ getAllParcels: 200 OK + pagination metadata { page: 1, limit: 5, total: 1, totalPages: 1 }
✓ getParcelById: 200 OK (matching ID)
✓ updateParcel: 200 OK (updated fields saved + validators executed)
✓ deleteParcel: 200 OK
✓ getParcelById after delete: 404 Not Found
```
