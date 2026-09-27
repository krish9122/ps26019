# Controllers Documentation

This directory contains Express request handlers and controllers for the Bhu Drishti backend.

## Implemented Controllers

### 1. `parcelController.js`
Handles full CRUD operations for cadastral parcels:
* `createParcel`: Create a new parcel document with GeoJSON and field whitelisting.
* `getAllParcels`: Retrieve paginated parcel records.
* `getParcelById`: Retrieve a single parcel by MongoDB ObjectId.
* `updateParcel`: Update parcel fields with validation and system field protection.
* `deleteParcel`: Remove a parcel by MongoDB ObjectId.

### 2. `ownerController.js`
Handles full management and governance lifecycle for land owners/entities:
* `createOwner`: Create a new owner with field whitelisting, operator injection defense, and duplicate identifier protection.
* `getAllOwners`: Retrieve paginated owner records with sorting (newest first) and optional filtering (`ownerType`, `isActive`, safe regex `search` on `fullName` and `ownerId`).
* `getOwnerById`: Retrieve a single owner by MongoDB ObjectId.
* `updateOwner`: Update owner attributes using the safe `findById()` + `save()` pattern.
* `deactivateOwner`: Soft-deactivate an owner (`isActive = false`) to preserve historical ownership records.

For full architectural details, flowcharts, and security rules, see the root documentation:
[PARCEL_CONTROLLER_README.md](../../PARCEL_CONTROLLER_README.md).
