# Bhu Drishti Backend

An ESM-based Node.js and Express.js backend using **MongoDB + Mongoose** for land governance and land-risk analysis.

---

## Technology Stack

- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Web Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Spatial Indexing:** GeoJSON with MongoDB `2dsphere` indexes

---

## Getting Started

### 1. Prerequisites

You need a running MongoDB instance. You can use either:
- **Local MongoDB Community Server:** (Port 27017)
  - Windows / macOS / Linux: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Or via Docker:
    ```bash
    docker run -d --name bhu_drishti_mongo -p 27017:27017 mongo:7
    ```
- **MongoDB Atlas (Cloud):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and obtain your connection string.

### 2. Environment Configuration

Copy the example environment file:

```bash
# On Linux / macOS:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Open `.env` and verify your MongoDB URI:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bhu_drishti

# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/bhu_drishti?retryWrites=true&w=majority
```

### 3. Installation

```bash
npm install
```

### 4. Seed Demo Data

Run the database seeder to load synthetic parcels, co-owners, transactions, court litigation, and risk assessments:

```bash
npm run seed
```

This populates 8 realistic test parcels (clean titles, co-ownerships, active court stays, boundary overlaps, and unmapped plots).

### 5. Running the Backend

```bash
# Production mode:
npm start

# Development mode (with live watch):
npm run dev
```

When MongoDB is reachable, the console outputs:
```text
MongoDB connected successfully to host: localhost, database: bhu_drishti
Server running on http://localhost:5000
```

---

## Health Check Endpoint

Send a `GET` request to `http://localhost:5000/api/health`:

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Database Architecture & GeoJSON

The MongoDB data layer is organized around the following Mongoose models in `src/models/`:

1. **`User` (`users`):** System users with role-based access (`ADMIN`, `OFFICER`, `SURVEYOR`, `ANALYST`, `CITIZEN`).
2. **`Owner` (`owners`):** Individuals, companies, trusts, or government bodies holding land interest.
3. **`Parcel` (`parcels`):** Cadastral land units storing:
   - Cadastral identifier (`parcelId`, `ulpin`, `surveyNumber`)
   - Official revenue area (`recordedAreaSqm`)
   - PostGIS-equivalent geodetic area (`gisAreaSqm`) and discrepancy percentage auto-computed in pre-validation
   - GeoJSON geometry with **`2dsphere`** index
   - Co-ownership array with fractional shares (strictly validated $\le 100\%$)
   - Active legal litigation references
4. **`Transaction` (`transactions`):** Historical deed transfers, sales, inheritances, and mortgages.
5. **`LegalCase` (`legalcases`):** Court disputes, interim injunctions, and stay orders with CNR numbers.
6. **`RiskAssessment` (`riskassessments`):** Deterministic risk engine outputs (`score`, `riskLevel`) and atomic explanatory indicators.

### GeoJSON Spatial Query Example

Parcels store standard GeoJSON `Polygon` and `MultiPolygon` geometries with a `2dsphere` index:

```javascript
// Point-in-polygon lookup: Find parcel covering a GPS coordinate
const parcel = await Parcel.findOne({
  geometry: {
    $geoIntersects: {
      $geometry: {
        type: "Point",
        coordinates: [73.7103, 18.5903] // [longitude, latitude]
      }
    }
  }
});

// Proximity search: Find parcels within 500 meters of a coordinate
const nearbyParcels = await Parcel.find({
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [73.7145, 18.5912]
      },
      $maxDistance: 500 // meters
    }
  }
});
```

---

## Project Folder Guide

- `src/config/db.js` — Mongoose database connection with error handling and timeout safeguards.
- `src/models/` — Mongoose document models and schemas (`User`, `Owner`, `Parcel`, `Transaction`, `LegalCase`, `RiskAssessment`).
- `src/seeds/seed.js` — Database demo seeder for testing and development.
- `src/utils/geoUtils.js` — Spherical excess area calculation and centroid derivation for GeoJSON.
- `src/controllers/` — Request handlers for upcoming features.
- `src/routes/` — Express route definitions.
- `src/middleware/` — Error handling and 404 middlewares.
- `src/services/` — Business logic and service layers.
- `src/utils/` — Shared API response, error, and async utilities.
