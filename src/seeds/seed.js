import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import {
  User,
  Owner,
  Parcel,
  Transaction,
  LegalCase,
  RiskAssessment,
} from "../models/index.js";

/**
 * Synthetic Demo Dataset for Bhu Drishti (SIH Prototype).
 * NOTE: All data is completely synthetic and generated for demonstration/testing.
 */
async function seedDatabase() {
  console.log("Connecting to MongoDB for seeding...");
  await connectDB();

  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Owner.deleteMany({}),
    Parcel.deleteMany({}),
    Transaction.deleteMany({}),
    LegalCase.deleteMany({}),
    RiskAssessment.deleteMany({}),
  ]);

  console.log("1. Seeding Users...");
  const users = await User.create([
    {
      fullName: "Rajesh K. Sharma",
      email: "admin.portal@bhudrishti.gov.in",
      passwordHash: "$2b$12$e80MvQk70.demo.hashed.password.placeholder",
      role: "ADMIN",
      department: "Land Records Directorate",
      phoneNumber: "+919820011223",
      isActive: true,
    },
    {
      fullName: "Pooja Deshmukh",
      email: "tehsildar.mulshi@bhudrishti.gov.in",
      passwordHash: "$2b$12$e80MvQk70.demo.hashed.password.placeholder",
      role: "OFFICER",
      department: "Revenue & Rehabilitation Dept",
      phoneNumber: "+919820033445",
      isActive: true,
    },
    {
      fullName: "Vikram S. Gaikwad",
      email: "cadastral.surveyor@bhudrishti.gov.in",
      passwordHash: "$2b$12$e80MvQk70.demo.hashed.password.placeholder",
      role: "SURVEYOR",
      department: "District Cadastral Survey Office",
      phoneNumber: "+919820055667",
      isActive: true,
    },
    {
      fullName: "Ananya Sengupta",
      email: "analyst.risk@bhudrishti.gov.in",
      passwordHash: "$2b$12$e80MvQk70.demo.hashed.password.placeholder",
      role: "ANALYST",
      department: "SIH Risk Analytics Cell",
      phoneNumber: "+919820077889",
      isActive: true,
    },
    {
      fullName: "Ramesh S. Patil",
      email: "citizen.user@example.com",
      passwordHash: "$2b$12$e80MvQk70.demo.hashed.password.placeholder",
      role: "CITIZEN",
      department: "Public Citizen",
      phoneNumber: "+919820099001",
      isActive: true,
    },
  ]);
  console.log(`✓ Inserted ${users.length} users.`);

  console.log("2. Seeding Owners...");
  const owners = await Owner.create([
    {
      ownerId: "OWN-001",
      ownerType: "INDIVIDUAL",
      fullName: "Ramesh Shankar Patil",
      fatherOrHusbandName: "Shankar B. Patil",
      identifierType: "PAN",
      identifierHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      contactPhone: "+919820011111",
      contactEmail: "ramesh.patil@example.com",
      permanentAddress: "House No. 12, Main Bazar, Marunji, Mulshi, Pune 411057",
    },
    {
      ownerId: "OWN-002",
      ownerType: "INDIVIDUAL",
      fullName: "Sunita Ramesh Patil",
      fatherOrHusbandName: "Ramesh S. Patil",
      identifierType: "AADHAAR_HASH",
      identifierHash: "d8578edf8458ce06fbc5bb76a58c5ca4ae50b467614d9b232616238b69826a79",
      contactPhone: "+919820022222",
      contactEmail: "sunita.patil@example.com",
      permanentAddress: "Plot 4, Patil Wada, Marunji, Mulshi, Pune 411057",
    },
    {
      ownerId: "OWN-003",
      ownerType: "INDIVIDUAL",
      fullName: "Anand Ramesh Patil",
      fatherOrHusbandName: "Ramesh S. Patil",
      identifierType: "PAN",
      identifierHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      contactPhone: "+919820033333",
      contactEmail: "anand.patil@example.com",
      permanentAddress: "Flat 302, Green Meadows, Wakad, Pune 411057",
    },
    {
      ownerId: "OWN-004",
      ownerType: "INDIVIDUAL",
      fullName: "Kavita Ramesh Patil",
      fatherOrHusbandName: "Ramesh S. Patil",
      identifierType: "AADHAAR_HASH",
      identifierHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      contactPhone: "+919820044444",
      contactEmail: "kavita.patil@example.com",
      permanentAddress: "B-14, Baner Residency, Baner Road, Pune 411045",
    },
    {
      ownerId: "OWN-005",
      ownerType: "COMPANY",
      fullName: "Zenith Infraventures Pvt Ltd",
      identifierType: "CIN",
      identifierHash: "U45200MH2015PTC261984",
      contactPhone: "+912066889900",
      contactEmail: "legal@zenithinfra.demo",
      permanentAddress: "Tower B, Cybercity Magarpatta, Hadapsar, Pune 411028",
    },
    {
      ownerId: "OWN-006",
      ownerType: "INDIVIDUAL",
      fullName: "Kishore M. Shinde",
      fatherOrHusbandName: "Maruti Shinde",
      identifierType: "PAN",
      identifierHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      contactPhone: "+919820066666",
      contactEmail: "kishore.shinde@example.com",
      permanentAddress: "Survey 51, Village Maan, Mulshi, Pune 411057",
    },
    {
      ownerId: "OWN-007",
      ownerType: "INDIVIDUAL",
      fullName: "Balasaheb K. Tapkir",
      fatherOrHusbandName: "Kashinath Tapkir",
      identifierType: "PAN",
      identifierHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      contactPhone: "+919820077777",
      contactEmail: "b.tapkir@example.com",
      permanentAddress: "Tapkir Vasti, Village Maan, Mulshi, Pune 411057",
    },
    {
      ownerId: "OWN-008",
      ownerType: "INDIVIDUAL",
      fullName: "Vikas Narayan Jagtap",
      fatherOrHusbandName: "Narayan Jagtap",
      identifierType: "AADHAAR_HASH",
      identifierHash: "bc6e5229649942a1975e11f7c0067ff24976c7c25c040d995cb4d6ceef4e8e19",
      contactPhone: "+919820088888",
      contactEmail: "vikas.jagtap@example.com",
      permanentAddress: "Gaothan Purva, Marunji, Mulshi, Pune 411057",
    },
    {
      ownerId: "OWN-009",
      ownerType: "COMPANY",
      fullName: "Sahyadri Logistics LLP",
      identifierType: "REGISTRATION_NO",
      identifierHash: "AAA-9921-MAH",
      contactPhone: "+912027401122",
      contactEmail: "compliance@sahyadrilogistics.demo",
      permanentAddress: "Industrial Area Phase 2, Chakan, Pune 410501",
    },
    {
      ownerId: "OWN-010",
      ownerType: "COMPANY",
      fullName: "Deccan Warehousing Solutions Ltd",
      identifierType: "CIN",
      identifierHash: "U63020MH2012PLC230111",
      contactPhone: "+912027403344",
      contactEmail: "contact@deccanwarehousing.demo",
      permanentAddress: "Deccan Chambers, FC Road, Shivaji Nagar, Pune 411005",
    },
  ]);
  console.log(`✓ Inserted ${owners.length} owners.`);

  // Map for easy reference
  const ownerMap = {};
  owners.forEach((o) => {
    ownerMap[o.ownerId] = o;
  });

  console.log("3. Seeding Legal Cases...");
  const legalCases = await LegalCase.create([
    {
      caseNumber: "SCS/182/2023",
      courtName: "Court of Civil Judge Senior Division, Pune",
      courtLevel: "DISTRICT_COURT",
      caseType: "BOUNDARY_DISPUTE",
      filingDate: new Date("2023-04-18"),
      firstHearingDate: new Date("2023-05-10"),
      nextHearingDate: new Date("2026-10-15"),
      status: "STAY_ORDER_GRANTED",
      petitionerNames: "Balasaheb K. Tapkir and Others",
      respondentNames: "Kishore M. Shinde and State of Maharashtra",
      description:
        "Suit for declaration, permanent injunction, and rectification of cadastral map boundaries in Survey 51.",
      interimOrderDetails:
        "Status quo granted. Restrained all parties from changing land nature or creating third-party rights.",
      sourceReferenceUrl: "https://services.ecourts.gov.in/ecourtindia_v6/?p=pune/scs1822023",
      cnrNumber: "MHPU020011822023",
      isActive: true,
    },
    {
      caseNumber: "REV/FOR/92/2024",
      courtName: "Maharashtra Revenue Tribunal, Pune Bench",
      courtLevel: "REVENUE_TRIBUNAL",
      caseType: "ENCROACHMENT",
      filingDate: new Date("2024-02-11"),
      firstHearingDate: new Date("2024-03-01"),
      nextHearingDate: new Date("2026-11-20"),
      status: "ACTIVE",
      petitionerNames: "Divisional Forest Officer, Pune Forest Division",
      respondentNames: "Zenith Infraventures Pvt Ltd & Land Revenue Officers",
      description:
        "Proceedings under Section 50 of Maharashtra Land Revenue Code for illegal enclosure of eco-sensitive forest buffer in Survey 88.",
      interimOrderDetails: "Show cause notice issued; interim halt on any commercial earth excavation.",
      sourceReferenceUrl: "https://mrt.maharashtra.gov.in/cases/2024/92",
      cnrNumber: "MHMRT020000922024",
      isActive: true,
    },
    {
      caseNumber: "RCS/512/2024",
      courtName: "Court of Civil Judge Junior Division, Paud, Mulshi",
      courtLevel: "TALUK_COURT",
      caseType: "PARTITION_SUIT",
      filingDate: new Date("2024-09-05"),
      firstHearingDate: new Date("2024-10-12"),
      nextHearingDate: new Date("2026-12-05"),
      status: "PENDING_HEARING",
      petitionerNames: "Sunita Shankar Jagtap (Legal Heir)",
      respondentNames: "Sahyadri Logistics LLP & Promoters",
      description:
        "Suit claiming undivided 1/4th coparcenary share in ancestral Survey 63/2 sold without daughter consent.",
      interimOrderDetails: "Notice issued to defendant warehouse firms to produce title deeds.",
      sourceReferenceUrl: "https://services.ecourts.gov.in/ecourtindia_v6/?p=paud/rcs5122024",
      cnrNumber: "MHPU090005122024",
      isActive: true,
    },
  ]);
  console.log(`✓ Inserted ${legalCases.length} legal cases.`);

  const caseMap = {};
  legalCases.forEach((c) => {
    caseMap[c.caseNumber] = c;
  });

  console.log("4. Seeding Parcels (with GeoJSON boundaries & co-owners)...");
  const parcels = await Parcel.create([
    // Parcel 1: Low-Risk Clean Parcel (Survey 42/1)
    {
      parcelId: "PCL-PUN-001",
      ulpin: "MH27MUL0042001",
      surveyNumber: "42",
      subDivisionNumber: "1",
      recordedAreaSqm: 4000.0,
      areaUnit: "SQ_METER",
      landType: "AGRICULTURAL",
      landUseCategory: "Irrigated Single Crop",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Marunji",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.71, 18.59],
            [73.7106, 18.59],
            [73.7106, 18.59057],
            [73.71, 18.59057],
            [73.71, 18.59],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-001"]._id,
          ownerId: "OWN-001",
          name: ownerMap["OWN-001"].fullName,
          share: 100.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "FREEHOLD",
          acquisitionDate: new Date("2012-04-15"),
          mutationEntryNo: "MUT-2012-4211",
          remarks: "Sole registered owner via partition deed.",
        },
      ],
      legalCases: [],
      status: "ACTIVE",
      notes: "Clear ancestral agricultural land with verified boundaries and single owner.",
      metadata: { demoTag: "LOW_RISK_CLEAN_TITLE", cadastralMapSheet: "Sheet-42-A" },
    },
    // Parcel 2: Co-ownership Parcel (Survey 42/2)
    {
      parcelId: "PCL-PUN-002",
      ulpin: "MH27MUL0042002",
      surveyNumber: "42",
      subDivisionNumber: "2",
      recordedAreaSqm: 6500.0,
      areaUnit: "SQ_METER",
      landType: "AGRICULTURAL",
      landUseCategory: "Horticulture / Fruit Orchard",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Marunji",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.7107, 18.59],
            [73.7115, 18.59],
            [73.7115, 18.590695],
            [73.7107, 18.590695],
            [73.7107, 18.59],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-002"]._id,
          ownerId: "OWN-002",
          name: ownerMap["OWN-002"].fullName,
          share: 40.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "COPARCENARY",
          acquisitionDate: new Date("2018-08-20"),
          mutationEntryNo: "MUT-2018-5520",
          remarks: "Co-parcener share registered.",
        },
        {
          owner: ownerMap["OWN-003"]._id,
          ownerId: "OWN-003",
          name: ownerMap["OWN-003"].fullName,
          share: 35.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "COPARCENARY",
          acquisitionDate: new Date("2018-08-20"),
          mutationEntryNo: "MUT-2018-5520",
          remarks: "Co-parcener share registered.",
        },
        {
          owner: ownerMap["OWN-004"]._id,
          ownerId: "OWN-004",
          name: ownerMap["OWN-004"].fullName,
          share: 25.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "COPARCENARY",
          acquisitionDate: new Date("2018-08-20"),
          mutationEntryNo: "MUT-2018-5520",
          remarks: "Co-parcener share registered.",
        },
      ],
      legalCases: [],
      status: "ACTIVE",
      notes: "Partitioned family property held jointly by 3 heirs with clear mutual consent deeds.",
      metadata: { demoTag: "CO_OWNERSHIP_VALIDATED", cadastralMapSheet: "Sheet-42-B" },
    },
    // Parcel 3: Medium-Risk with rapid transactions & 5.8% area discrepancy (Survey 45/1)
    {
      parcelId: "PCL-PUN-003",
      ulpin: "MH27MUL0045001",
      surveyNumber: "45",
      subDivisionNumber: "1",
      recordedAreaSqm: 8500.0,
      areaUnit: "SQ_METER",
      landType: "COMMERCIAL",
      landUseCategory: "IT Corridor Commercial Zone",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Hinjawadi",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.712, 18.59],
            [73.713, 18.59],
            [73.713, 18.59077],
            [73.712, 18.59077],
            [73.712, 18.59],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-005"]._id,
          ownerId: "OWN-005",
          name: ownerMap["OWN-005"].fullName,
          share: 100.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "FREEHOLD",
          acquisitionDate: new Date("2025-01-10"),
          mutationEntryNo: "MUT-2025-9901",
          remarks: "Purchased under commercial development scheme.",
        },
      ],
      legalCases: [],
      status: "ACTIVE",
      notes:
        "Commercial parcel converted from agricultural land; transferred 3 times in quick succession with minor area discrepancy.",
      metadata: { demoTag: "MEDIUM_RISK_HIGH_TURNOVER", cadastralMapSheet: "Sheet-45-C" },
    },
    // Parcel 4: High-Risk with stay order & boundary overlap with Parcel 5 (Survey 51/1A)
    {
      parcelId: "PCL-PUN-004",
      ulpin: "MH27MUL005101A",
      surveyNumber: "51",
      subDivisionNumber: "1A",
      recordedAreaSqm: 7200.0,
      areaUnit: "SQ_METER",
      landType: "RESIDENTIAL",
      landUseCategory: "Urban Residential Scheme",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Maan",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.714, 18.591],
            [73.715, 18.591],
            [73.715, 18.59165],
            [73.714, 18.59165],
            [73.714, 18.591],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-006"]._id,
          ownerId: "OWN-006",
          name: ownerMap["OWN-006"].fullName,
          share: 100.0,
          ownershipStatus: "DISPUTED",
          ownershipNature: "FREEHOLD",
          acquisitionDate: new Date("2021-03-14"),
          mutationEntryNo: "MUT-2021-7812",
          remarks: "Title stayed by Hon Civil Judge Senior Division Pune.",
        },
      ],
      legalCases: [
        {
          legalCase: caseMap["SCS/182/2023"]._id,
          caseNumber: "SCS/182/2023",
          courtName: caseMap["SCS/182/2023"].courtName,
          disputeType: "PARTIAL_BOUNDARY",
          isStayActive: true,
          notes: "Defendant property; interim stay strictly prohibits alienating parcel.",
        },
      ],
      status: "DISPUTED",
      notes: "Subject to active civil court injunction. Geometry physically overlaps with Survey 51/1B.",
      metadata: { demoTag: "HIGH_RISK_OVERLAP_AND_COURT_STAY", cadastralMapSheet: "Sheet-51-A" },
    },
    // Parcel 5: High-Risk overlapping boundary parcel with Parcel 4 (Survey 51/1B)
    {
      parcelId: "PCL-PUN-005",
      ulpin: "MH27MUL005101B",
      surveyNumber: "51",
      subDivisionNumber: "1B",
      recordedAreaSqm: 5400.0,
      areaUnit: "SQ_METER",
      landType: "RESIDENTIAL",
      landUseCategory: "Urban Residential Scheme",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Maan",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.7147, 18.591],
            [73.7156, 18.591],
            [73.7156, 18.59158],
            [73.7147, 18.59158],
            [73.7147, 18.591],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-007"]._id,
          ownerId: "OWN-007",
          name: ownerMap["OWN-007"].fullName,
          share: 100.0,
          ownershipStatus: "DISPUTED",
          ownershipNature: "FREEHOLD",
          acquisitionDate: new Date("2020-11-28"),
          mutationEntryNo: "MUT-2020-6641",
          remarks: "Contesting boundary encroachment by Survey 51/1A.",
        },
      ],
      legalCases: [
        {
          legalCase: caseMap["SCS/182/2023"]._id,
          caseNumber: "SCS/182/2023",
          courtName: caseMap["SCS/182/2023"].courtName,
          disputeType: "PARTIAL_BOUNDARY",
          isStayActive: true,
          notes: "Petitioner property claiming boundary overlap and illegal fence positioning.",
        },
      ],
      status: "DISPUTED",
      notes: "Cadastral boundary conflicts with Survey 51/1A due to disputed survey demarcation.",
      metadata: { demoTag: "HIGH_RISK_BOUNDARY_DISPUTE", cadastralMapSheet: "Sheet-51-B" },
    },
    // Parcel 6: Critical-Risk bordering forest land with >40% area discrepancy (Survey 88)
    {
      parcelId: "PCL-PUN-006",
      ulpin: "MH27MUL0088000",
      surveyNumber: "88",
      recordedAreaSqm: 12000.0,
      areaUnit: "SQ_METER",
      landType: "GOVERNMENT_RESERVED",
      landUseCategory: "Forest Buffer / Ridge Zone",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Hinjawadi",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.716, 18.592],
            [73.7175, 18.592],
            [73.7175, 18.59298],
            [73.716, 18.59298],
            [73.716, 18.592],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-005"]._id,
          ownerId: "OWN-005",
          name: ownerMap["OWN-005"].fullName,
          share: 100.0,
          ownershipStatus: "DISPUTED",
          ownershipNature: "FREEHOLD",
          acquisitionDate: new Date("2023-06-01"),
          mutationEntryNo: "MUT-2023-1188",
          remarks: "Forest department notice issued for eco-buffer encroachment.",
        },
      ],
      legalCases: [
        {
          legalCase: caseMap["REV/FOR/92/2024"]._id,
          caseNumber: "REV/FOR/92/2024",
          courtName: caseMap["REV/FOR/92/2024"].courtName,
          disputeType: "FULL_PARCEL",
          isStayActive: false,
          notes: "Forest department challenge seeking cancellation of revenue mutation.",
        },
      ],
      status: "DISPUTED",
      notes: "Encloses >17,100 sqm against a recorded area of only 12,000 sqm encroaching on state forest reserve.",
      metadata: { demoTag: "CRITICAL_RISK_GOVT_ENCROACHMENT", cadastralMapSheet: "Sheet-88-Eco" },
    },
    // Parcel 7: Edge Case: Missing ULPIN, Missing GIS Geometry, Legacy Gaothan Land
    {
      parcelId: "PCL-PUN-007",
      ulpin: null, // Missing ULPIN
      surveyNumber: "104",
      subDivisionNumber: "P",
      recordedAreaSqm: 3200.0,
      areaUnit: "SQ_METER",
      landType: "RESIDENTIAL",
      landUseCategory: "Old Gaothan Settlement",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Marunji",
      pincode: "411057",
      geometry: null, // Missing GIS geometry
      owners: [
        {
          owner: ownerMap["OWN-008"]._id,
          ownerId: "OWN-008",
          name: ownerMap["OWN-008"].fullName,
          share: 100.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "FREEHOLD",
          acquisitionDate: new Date("1995-10-12"),
          mutationEntryNo: "MUT-1995-0914",
          remarks: "Recorded in Village Gaothan Register; pending SVAMITVA survey.",
        },
      ],
      legalCases: [],
      status: "PENDING_SURVEY",
      notes: "Unregistered gaothan plot without digital shapefile or Bhu-Aadhaar ULPIN. Drone survey pending.",
      metadata: { demoTag: "EDGE_CASE_MISSING_DATA", legacyRegisterRef: "7/12-Vol-9-Page-12" },
    },
    // Parcel 8: Industrial Parcel with Bank Mortgage and Legal Claim (Survey 63/2)
    {
      parcelId: "PCL-PUN-008",
      ulpin: "MH27MUL0063002",
      surveyNumber: "63",
      subDivisionNumber: "2",
      recordedAreaSqm: 10000.0,
      areaUnit: "SQ_METER",
      landType: "INDUSTRIAL",
      landUseCategory: "Logistics & Warehousing Hub",
      state: "Maharashtra",
      district: "Pune",
      subDistrict: "Mulshi",
      village: "Marunji",
      pincode: "411057",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.718, 18.59],
            [73.7192, 18.59],
            [73.7192, 18.590715],
            [73.718, 18.590715],
            [73.718, 18.59],
          ],
        ],
      },
      owners: [
        {
          owner: ownerMap["OWN-009"]._id,
          ownerId: "OWN-009",
          name: ownerMap["OWN-009"].fullName,
          share: 60.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "MORTGAGED",
          acquisitionDate: new Date("2022-02-18"),
          mutationEntryNo: "MUT-2022-3301",
          remarks: "Mortgaged to State Bank of India Industrial Branch.",
        },
        {
          owner: ownerMap["OWN-010"]._id,
          ownerId: "OWN-010",
          name: ownerMap["OWN-010"].fullName,
          share: 40.0,
          ownershipStatus: "ACTIVE",
          ownershipNature: "MORTGAGED",
          acquisitionDate: new Date("2022-02-18"),
          mutationEntryNo: "MUT-2022-3302",
          remarks: "Mortgaged to State Bank of India Industrial Branch.",
        },
      ],
      legalCases: [
        {
          legalCase: caseMap["RCS/512/2024"]._id,
          caseNumber: "RCS/512/2024",
          courtName: caseMap["RCS/512/2024"].courtName,
          disputeType: "OWNERSHIP_SHARE",
          isStayActive: false,
          notes: "Unpartitioned coparcenary claim against logistics developers.",
        },
      ],
      status: "ACTIVE",
      notes: "Active logistics facility with bank mortgage charge and ongoing coparcenary title dispute in civil court.",
      metadata: { demoTag: "MEDIUM_HIGH_RISK_ENCUMBERED", cadastralMapSheet: "Sheet-63-Ind" },
    },
  ]);
  console.log(`✓ Inserted ${parcels.length} parcels.`);

  // Map parcels by parcelId
  const parcelMap = {};
  parcels.forEach((p) => {
    parcelMap[p.parcelId] = p;
  });

  // Cross-link parcels to legal cases
  await LegalCase.findByIdAndUpdate(caseMap["SCS/182/2023"]._id, {
    parcels: [
      {
        parcel: parcelMap["PCL-PUN-004"]._id,
        parcelId: "PCL-PUN-004",
        disputeType: "PARTIAL_BOUNDARY",
        isStayActive: true,
      },
      {
        parcel: parcelMap["PCL-PUN-005"]._id,
        parcelId: "PCL-PUN-005",
        disputeType: "PARTIAL_BOUNDARY",
        isStayActive: true,
      },
    ],
  });

  await LegalCase.findByIdAndUpdate(caseMap["REV/FOR/92/2024"]._id, {
    parcels: [
      {
        parcel: parcelMap["PCL-PUN-006"]._id,
        parcelId: "PCL-PUN-006",
        disputeType: "FULL_PARCEL",
        isStayActive: false,
      },
    ],
  });

  await LegalCase.findByIdAndUpdate(caseMap["RCS/512/2024"]._id, {
    parcels: [
      {
        parcel: parcelMap["PCL-PUN-008"]._id,
        parcelId: "PCL-PUN-008",
        disputeType: "OWNERSHIP_SHARE",
        isStayActive: false,
      },
    ],
  });

  console.log("5. Seeding Transactions...");
  const transactions = await Transaction.create([
    {
      transactionId: "TXN-2012-001",
      parcel: parcelMap["PCL-PUN-001"]._id,
      parcelId: "PCL-PUN-001",
      previousOwner: null,
      previousOwnerName: "STATE / ANCESTRAL",
      newOwner: ownerMap["OWN-001"]._id,
      newOwnerName: ownerMap["OWN-001"].fullName,
      transactionType: "INHERITANCE",
      transactionDate: new Date("2012-04-15"),
      registrationNumber: "SRO-MUL-2012/1042",
      sroOffice: "Sub-Registrar Office, Paud, Mulshi",
      considerationAmount: 0.0,
      marketGuidelineValue: 2500000.0,
      status: "REGISTERED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2012-1042.pdf",
      notes: "Mutation passed after legal succession inquiry.",
    },
    {
      transactionId: "TXN-2018-002",
      parcel: parcelMap["PCL-PUN-002"]._id,
      parcelId: "PCL-PUN-002",
      previousOwner: ownerMap["OWN-001"]._id,
      previousOwnerName: ownerMap["OWN-001"].fullName,
      newOwner: ownerMap["OWN-002"]._id,
      newOwnerName: ownerMap["OWN-002"].fullName,
      transactionType: "PARTITION_DEED",
      transactionDate: new Date("2018-08-20"),
      registrationNumber: "SRO-MUL-2018/4412",
      sroOffice: "Sub-Registrar Office, Paud, Mulshi",
      considerationAmount: 0.0,
      marketGuidelineValue: 4500000.0,
      status: "REGISTERED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2018-4412.pdf",
      notes: "Mutual partition deed dividing ancestral holdings.",
    },
    {
      transactionId: "TXN-2022-003",
      parcel: parcelMap["PCL-PUN-003"]._id,
      parcelId: "PCL-PUN-003",
      previousOwner: ownerMap["OWN-001"]._id,
      previousOwnerName: ownerMap["OWN-001"].fullName,
      newOwner: ownerMap["OWN-006"]._id,
      newOwnerName: ownerMap["OWN-006"].fullName,
      transactionType: "SALE_DEED",
      transactionDate: new Date("2022-07-11"),
      registrationNumber: "SRO-HV-2022/8821",
      sroOffice: "Sub-Registrar Office, Haveli-4, Pune",
      considerationAmount: 18000000.0,
      marketGuidelineValue: 16500000.0,
      status: "REGISTERED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2022-8821.pdf",
      notes: "Agricultural land sale before zone conversion.",
    },
    {
      transactionId: "TXN-2023-004",
      parcel: parcelMap["PCL-PUN-003"]._id,
      parcelId: "PCL-PUN-003",
      previousOwner: ownerMap["OWN-006"]._id,
      previousOwnerName: ownerMap["OWN-006"].fullName,
      newOwner: ownerMap["OWN-007"]._id,
      newOwnerName: ownerMap["OWN-007"].fullName,
      transactionType: "SALE_DEED",
      transactionDate: new Date("2023-11-05"),
      registrationNumber: "SRO-HV-2023/1209",
      sroOffice: "Sub-Registrar Office, Haveli-4, Pune",
      considerationAmount: 28500000.0,
      marketGuidelineValue: 25000000.0,
      status: "REGISTERED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2023-1209.pdf",
      notes: "Flipped within 16 months with 58% valuation markup.",
    },
    {
      transactionId: "TXN-2025-005",
      parcel: parcelMap["PCL-PUN-003"]._id,
      parcelId: "PCL-PUN-003",
      previousOwner: ownerMap["OWN-007"]._id,
      previousOwnerName: ownerMap["OWN-007"].fullName,
      newOwner: ownerMap["OWN-005"]._id,
      newOwnerName: ownerMap["OWN-005"].fullName,
      transactionType: "SALE_DEED",
      transactionDate: new Date("2025-01-10"),
      registrationNumber: "SRO-HV-2025/0314",
      sroOffice: "Sub-Registrar Office, Haveli-4, Pune",
      considerationAmount: 42000000.0,
      marketGuidelineValue: 38000000.0,
      status: "REGISTERED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2025-0314.pdf",
      notes: "Third transfer within 30 months. Acquired by Zenith Infraventures.",
    },
    {
      transactionId: "TXN-2021-006",
      parcel: parcelMap["PCL-PUN-004"]._id,
      parcelId: "PCL-PUN-004",
      previousOwner: ownerMap["OWN-007"]._id,
      previousOwnerName: ownerMap["OWN-007"].fullName,
      newOwner: ownerMap["OWN-006"]._id,
      newOwnerName: ownerMap["OWN-006"].fullName,
      transactionType: "SALE_DEED",
      transactionDate: new Date("2021-03-14"),
      registrationNumber: "SRO-MUL-2021/3390",
      sroOffice: "Sub-Registrar Office, Paud, Mulshi",
      considerationAmount: 14000000.0,
      marketGuidelineValue: 13000000.0,
      status: "DISPUTED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2021-3390.pdf",
      notes: "Sale registered despite pending demarcation protest from neighbor.",
    },
    {
      transactionId: "TXN-2024-007",
      parcel: parcelMap["PCL-PUN-008"]._id,
      parcelId: "PCL-PUN-008",
      previousOwner: null,
      previousOwnerName: "STATE / DEVELOPER",
      newOwner: ownerMap["OWN-009"]._id,
      newOwnerName: ownerMap["OWN-009"].fullName,
      transactionType: "MORTGAGE",
      transactionDate: new Date("2024-03-22"),
      registrationNumber: "SRO-HV-2024/9021",
      sroOffice: "Sub-Registrar Office, Haveli-2, Pune",
      considerationAmount: 50000000.0,
      marketGuidelineValue: 45000000.0,
      status: "REGISTERED",
      deedDocumentUrl: "https://docs.bhudrishti.demo/deeds/2024-9021.pdf",
      notes: "Equitable mortgage lien registered in favor of State Bank of India.",
    },
  ]);
  console.log(`✓ Inserted ${transactions.length} transactions.`);

  console.log("6. Seeding Risk Assessments & Explanatory Indicators...");
  const riskAssessments = await RiskAssessment.create([
    // Parcel 1: Low Risk (Score: 8)
    {
      parcel: parcelMap["PCL-PUN-001"]._id,
      parcelId: "PCL-PUN-001",
      score: 8,
      riskLevel: "LOW",
      indicators: [
        {
          type: "CLEAN_TITLE",
          name: "Clean title verified",
          severity: "INFO",
          points: 0,
          description: "Clear ancestral title with zero active litigation.",
          evidence: { verifiedRegistry: true },
        },
      ],
      ruleBreakdown: { legalRisk: 0, spatialDiscrepancy: 0, velocityRisk: 0, encumbranceRisk: 8 },
      summaryText:
        "Clean cadastral title with zero active litigation, valid ULPIN, and geodetic area precisely matching 7/12 revenue extract.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 2: Low Risk (Score: 12)
    {
      parcel: parcelMap["PCL-PUN-002"]._id,
      parcelId: "PCL-PUN-002",
      score: 12,
      riskLevel: "LOW",
      indicators: [
        {
          type: "CO_OWNERSHIP_VALIDATED",
          name: "Co-ownership shares verified",
          severity: "INFO",
          points: 0,
          description: "Shares among 3 co-heirs sum to exactly 100.00%.",
          evidence: { totalOwners: 3, totalShare: 100.0 },
        },
      ],
      ruleBreakdown: { legalRisk: 0, spatialDiscrepancy: 2, velocityRisk: 0, encumbranceRisk: 10 },
      summaryText:
        "Valid co-ownership holding with shares summing to exactly 100%. No litigation or boundary conflicts recorded.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 3: Medium Risk (Score: 48)
    {
      parcel: parcelMap["PCL-PUN-003"]._id,
      parcelId: "PCL-PUN-003",
      score: 48,
      riskLevel: "MEDIUM",
      indicators: [
        {
          type: "HIGH_TRANSFER_VELOCITY",
          name: "Recent ownership transfer",
          severity: "MEDIUM",
          points: 30,
          description: "Parcel was transacted 3 times within 30 calendar months, indicating speculative land flipping.",
          evidence: { transferCount: 3, timeWindowMonths: 30, latestDeed: "SRO-HV-2025/0314" },
        },
        {
          type: "AREA_DISCREPANCY",
          name: "Boundary mismatch",
          severity: "LOW",
          points: 18,
          description:
            "GeoJSON calculated polygon area (~8,993 sq.m) exceeds recorded revenue area (8,500 sq.m) by 5.8%.",
          evidence: { recordedAreaSqm: 8500.0, gisAreaSqm: 8993.0, discrepancyPercentage: 5.8 },
        },
      ],
      ruleBreakdown: { legalRisk: 0, spatialDiscrepancy: 18, velocityRisk: 30, encumbranceRisk: 0 },
      summaryText:
        "Medium risk triggered by high transaction velocity (3 transfers in under 3 years) and a 5.8% geodetic boundary inflation.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 4: High Risk (Score: 84)
    {
      parcel: parcelMap["PCL-PUN-004"]._id,
      parcelId: "PCL-PUN-004",
      score: 84,
      riskLevel: "HIGH",
      indicators: [
        {
          type: "ACTIVE_LEGAL_CASE",
          name: "Active legal case",
          severity: "HIGH",
          points: 45,
          description: "Civil court stay order granted in title & boundary dispute case SCS/182/2023.",
          evidence: {
            caseNumber: "SCS/182/2023",
            court: "Court of Civil Judge Senior Division, Pune",
            stayActive: true,
          },
        },
        {
          type: "BOUNDARY_OVERLAP",
          name: "Boundary mismatch",
          severity: "HIGH",
          points: 25,
          description: "GeoJSON boundary overlaps with adjacent parcel Survey 51/1B.",
          evidence: { conflictingSurveyNumber: "51/1B", conflictingParcelId: "PCL-PUN-005" },
        },
        {
          type: "RECENT_DISPUTED_SALE",
          name: "Recent ownership transfer",
          severity: "MEDIUM",
          points: 14,
          description: "Deed registration flagged as disputed in revenue portal.",
          evidence: { registrationNumber: "SRO-MUL-2021/3390", status: "DISPUTED" },
        },
      ],
      ruleBreakdown: { legalRisk: 45, spatialDiscrepancy: 25, velocityRisk: 14, encumbranceRisk: 0 },
      summaryText:
        "High risk flagged due to active civil court interim injunction (SCS/182/2023) and spatial boundary overlap with adjacent parcel Survey 51/1B.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 5: High Risk (Score: 79)
    {
      parcel: parcelMap["PCL-PUN-005"]._id,
      parcelId: "PCL-PUN-005",
      score: 79,
      riskLevel: "HIGH",
      indicators: [
        {
          type: "ACTIVE_LEGAL_CASE",
          name: "Active legal case",
          severity: "HIGH",
          points: 45,
          description: "Party to active boundary dispute suit SCS/182/2023 with status quo order.",
          evidence: { caseNumber: "SCS/182/2023", court: "Court of Civil Judge Senior Division, Pune" },
        },
        {
          type: "BOUNDARY_OVERLAP",
          name: "Boundary mismatch",
          severity: "HIGH",
          points: 24,
          description: "Cadastral boundary conflicts with Survey 51/1A.",
          evidence: { conflictingSurveyNumber: "51/1A", conflictingParcelId: "PCL-PUN-004" },
        },
        {
          type: "STATUS_QUO_INJUNCTION",
          name: "Injunction stay order",
          severity: "MEDIUM",
          points: 10,
          description: "Civil court order prohibits any physical demarcation or commercial transfer.",
          evidence: { stayActive: true, injunctionType: "STATUS_QUO" },
        },
      ],
      ruleBreakdown: { legalRisk: 45, spatialDiscrepancy: 24, velocityRisk: 10, encumbranceRisk: 0 },
      summaryText:
        "High risk driven by active boundary litigation and spatial polygon intersection with Survey 51/1A.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 6: Critical Risk (Score: 94)
    {
      parcel: parcelMap["PCL-PUN-006"]._id,
      parcelId: "PCL-PUN-006",
      score: 94,
      riskLevel: "CRITICAL",
      indicators: [
        {
          type: "ACTIVE_LEGAL_CASE",
          name: "Active legal case",
          severity: "CRITICAL",
          points: 35,
          description:
            "Active state tribunal proceeding initiated by Divisional Forest Officer for land encroachment.",
          evidence: { caseNumber: "REV/FOR/92/2024", forum: "Maharashtra Revenue Tribunal" },
        },
        {
          type: "SEVERE_BOUNDARY_MISMATCH",
          name: "Boundary mismatch",
          severity: "CRITICAL",
          points: 35,
          description:
            "Massive spatial discrepancy: GeoJSON polygon area (17,180 sq.m) is 43.2% larger than the 12,000 sq.m official recorded area.",
          evidence: { recordedAreaSqm: 12000.0, gisAreaSqm: 17180.0, discrepancyPercentage: 43.2 },
        },
        {
          type: "GOVT_RESERVED_LAND_CONFLICT",
          name: "Government land encroachment",
          severity: "HIGH",
          points: 24,
          description: "Parcel perimeter directly intersects demarcated state forest reserve boundary.",
          evidence: { zoneType: "GOVERNMENT_RESERVED", subCategory: "Forest Buffer" },
        },
      ],
      ruleBreakdown: { legalRisk: 35, spatialDiscrepancy: 35, velocityRisk: 0, encumbranceRisk: 24 },
      summaryText:
        "Critical risk! Severe area inflation (+43.2% beyond revenue records) and an active government forest encroachment suit.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 7: Medium Risk (Score: 52)
    {
      parcel: parcelMap["PCL-PUN-007"]._id,
      parcelId: "PCL-PUN-007",
      score: 52,
      riskLevel: "MEDIUM",
      indicators: [
        {
          type: "MISSING_ULPIN",
          name: "Missing ULPIN identifier",
          severity: "MEDIUM",
          points: 22,
          description: "Parcel has not been assigned a 14-digit standard Bhu-Aadhaar (ULPIN).",
          evidence: { isUlpinMissing: true },
        },
        {
          type: "MISSING_GIS_GEOMETRY",
          name: "Missing GIS boundary geometry",
          severity: "HIGH",
          points: 30,
          description: "Cadastral GeoJSON polygon does not exist in spatial database. Ground survey pending.",
          evidence: { isGeometryMissing: true, status: "PENDING_SURVEY" },
        },
      ],
      ruleBreakdown: { legalRisk: 0, spatialDiscrepancy: 30, velocityRisk: 0, encumbranceRisk: 22 },
      summaryText:
        "Medium risk arising from incomplete institutional records: missing Bhu-Aadhaar ULPIN and lack of digital GIS cadastral polygon.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
    // Parcel 8: Medium Risk (Score: 62)
    {
      parcel: parcelMap["PCL-PUN-008"]._id,
      parcelId: "PCL-PUN-008",
      score: 62,
      riskLevel: "MEDIUM",
      indicators: [
        {
          type: "ACTIVE_LEGAL_CASE",
          name: "Active legal case",
          severity: "HIGH",
          points: 30,
          description: "Coparcenary succession suit RCS/512/2024 filed by undisclosed legal heir.",
          evidence: { caseNumber: "RCS/512/2024", court: "Court of Civil Judge Junior Division, Paud" },
        },
        {
          type: "BANK_MORTGAGE_LIEN",
          name: "Institutional mortgage encumbrance",
          severity: "MEDIUM",
          points: 30,
          description: "Active mortgage lien of Rs. 50,000,000 registered with State Bank of India.",
          evidence: {
            chargeHolder: "State Bank of India",
            deedRef: "SRO-HV-2024/9021",
            amountInr: 50000000.0,
          },
        },
        {
          type: "CO_OWNERSHIP_STRUCTURE",
          name: "Corporate joint ownership",
          severity: "LOW",
          points: 2,
          description: "Ownership held between two corporate entities (60% / 40%).",
          evidence: {
            entityCount: 2,
            corporateHolders: ["Sahyadri Logistics LLP", "Deccan Warehousing Solutions Ltd"],
          },
        },
      ],
      ruleBreakdown: { legalRisk: 30, spatialDiscrepancy: 2, velocityRisk: 0, encumbranceRisk: 30 },
      summaryText:
        "Medium risk driven by active coparcenary succession lawsuit and high-value institutional mortgage charge.",
      isCurrent: true,
      engineVersion: "v1.0-deterministic",
      assessedBy: "RULE_ENGINE_V1",
    },
  ]);
  console.log(`✓ Inserted ${riskAssessments.length} risk assessments.`);

  console.log("\n========================================================");
  console.log("BHU DRISHTI MONGODB DEMO DATA SEEDED SUCCESSFULLY!");
  console.log("========================================================");
  console.log(`- Users: ${users.length}`);
  console.log(`- Owners: ${owners.length}`);
  console.log(`- Parcels: ${parcels.length}`);
  console.log(`- Transactions: ${transactions.length}`);
  console.log(`- Legal Cases: ${legalCases.length}`);
  console.log(`- Risk Assessments: ${riskAssessments.length}`);
  console.log("========================================================\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seedDatabase().catch((error) => {
  console.error("Seeding error:", error);
  process.exit(1);
});
