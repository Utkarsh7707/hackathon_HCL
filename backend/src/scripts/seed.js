/**
 * Seed Script
 * Usage:
 *   node src/scripts/seed.js           — idempotent (skips existing records)
 *   node src/scripts/seed.js --force   — drops super_admin + govt registry, then re-seeds
 */

import "../config/env.js"; // load .env first
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../config/db.js";
import env from "../config/env.js";
import User from "../models/User.js";
import GovtHospitalRegistry from "../models/GovtHospitalRegistry.js";
import Vaccine from "../models/Vaccine.js";
import Hospital from "../models/Hospital.js";
import HospitalAdminVerification from "../models/HospitalAdminVerification.js";
import HospitalVaccine from "../models/HospitalVaccine.js";
import VaccineSlotDay from "../models/VaccineSlotDay.js";

/* ─── colour helpers ─── */
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

const log = {
  info:    (msg) => console.log(`  ${c.cyan("ℹ")}  ${msg}`),
  ok:      (msg) => console.log(`  ${c.green("✔")}  ${msg}`),
  skip:    (msg) => console.log(`  ${c.yellow("⊘")}  ${c.dim(msg)}`),
  warn:    (msg) => console.log(`  ${c.yellow("⚠")}  ${msg}`),
  section: (msg) => console.log(`\n${c.bold(msg)}`),
  error:   (msg) => console.error(`  ${c.red("✖")}  ${msg}`),
};

/* ─── super admin credentials ─── */
const SUPER_ADMIN = {
  name:     "Super Admin",
  email:    "superadmin@vaxbook.in",
  password: "SuperAdmin@123",   // change after first login
  phone:    "+91-0000000000",
};

/* ─── mock govt hospital registry entries ─── */
const GOVT_HOSPITALS = [
  // Maharashtra
  { registrationNumber: "MH-HOS-2021-00101", hospitalName: "Lilavati Hospital & Research Centre", state: "Maharashtra", city: "Mumbai",    issuedYear: 2021 },
  { registrationNumber: "MH-HOS-2022-00204", hospitalName: "Kokilaben Dhirubhai Ambani Hospital",  state: "Maharashtra", city: "Mumbai",    issuedYear: 2022 },
  { registrationNumber: "MH-HOS-2020-00389", hospitalName: "Ruby Hall Clinic",                     state: "Maharashtra", city: "Pune",      issuedYear: 2020 },
  { registrationNumber: "MH-HOS-2023-00512", hospitalName: "Deenanath Mangeshkar Hospital",        state: "Maharashtra", city: "Pune",      issuedYear: 2023 },
  // Delhi
  { registrationNumber: "DL-HOS-2019-00771", hospitalName: "Apollo Hospital Sarita Vihar",         state: "Delhi",       city: "New Delhi", issuedYear: 2019 },
  { registrationNumber: "DL-HOS-2022-00856", hospitalName: "Max Super Speciality Hospital",        state: "Delhi",       city: "New Delhi", issuedYear: 2022 },
  { registrationNumber: "DL-HOS-2021-00933", hospitalName: "Fortis Hospital Shalimar Bagh",        state: "Delhi",       city: "New Delhi", issuedYear: 2021 },
  // Karnataka
  { registrationNumber: "KA-HOS-2020-01142", hospitalName: "Manipal Hospital Old Airport Road",   state: "Karnataka",   city: "Bengaluru", issuedYear: 2020 },
  { registrationNumber: "KA-HOS-2023-01278", hospitalName: "Narayana Health City",                 state: "Karnataka",   city: "Bengaluru", issuedYear: 2023 },
  { registrationNumber: "KA-HOS-2021-01351", hospitalName: "Columbia Asia Hospital Whitefield",    state: "Karnataka",   city: "Bengaluru", issuedYear: 2021 },
  // Tamil Nadu
  { registrationNumber: "TN-HOS-2022-01610", hospitalName: "Apollo Hospitals Greams Road",         state: "Tamil Nadu",  city: "Chennai",   issuedYear: 2022 },
  { registrationNumber: "TN-HOS-2020-01744", hospitalName: "MIOT International",                   state: "Tamil Nadu",  city: "Chennai",   issuedYear: 2020 },
  // Telangana
  { registrationNumber: "TS-HOS-2021-02031", hospitalName: "Yashoda Hospitals Somajiguda",         state: "Telangana",   city: "Hyderabad", issuedYear: 2021 },
  { registrationNumber: "TS-HOS-2023-02189", hospitalName: "KIMS Hospitals",                       state: "Telangana",   city: "Hyderabad", issuedYear: 2023 },
  // Gujarat
  { registrationNumber: "GJ-HOS-2019-02450", hospitalName: "Sterling Hospitals Ahmedabad",         state: "Gujarat",     city: "Ahmedabad", issuedYear: 2019 },
  { registrationNumber: "GJ-HOS-2022-02567", hospitalName: "HCG Cancer Centre",                    state: "Gujarat",     city: "Ahmedabad", issuedYear: 2022 },
  // West Bengal
  { registrationNumber: "WB-HOS-2020-02901", hospitalName: "Medica Superspecialty Hospital",       state: "West Bengal", city: "Kolkata",   issuedYear: 2020 },
  { registrationNumber: "WB-HOS-2021-03044", hospitalName: "Fortis Hospital Anandapur",            state: "West Bengal", city: "Kolkata",   issuedYear: 2021 },
  // Rajasthan
  { registrationNumber: "RJ-HOS-2023-03312", hospitalName: "Narayana Multispeciality Hospital",    state: "Rajasthan",   city: "Jaipur",    issuedYear: 2023 },
  { registrationNumber: "RJ-HOS-2020-03408", hospitalName: "Eternal Heart Care Centre",            state: "Rajasthan",   city: "Jaipur",    issuedYear: 2020 },
];

/* ─── seed super admin ─── */
async function seedSuperAdmin(force) {
  log.section("Super Admin");

  const existing = await User.findOne({ role: "super_admin" });

  if (existing && !force) {
    log.skip(`Super admin already exists → ${existing.email}`);
    return;
  }

  if (existing && force) {
    await User.deleteOne({ _id: existing._id });
    log.warn("Existing super admin removed (--force)");
  }

  if (!env.superAdminSetupKey) {
    log.warn("SUPER_ADMIN_SETUP_KEY not set in .env — super admin creation may fail at runtime.");
    log.warn("Seed is inserting directly, bypassing the setup key check.");
  }

  const passwordHash = await bcrypt.hash(
    SUPER_ADMIN.password,
    env.bcryptSaltRounds || 10
  );

  await User.create({
    name:         SUPER_ADMIN.name,
    email:        SUPER_ADMIN.email,
    passwordHash,
    role:         "super_admin",
    phone:        SUPER_ADMIN.phone,
    isActive:     true,
  });

  log.ok(`Created super admin  →  ${c.cyan(SUPER_ADMIN.email)}`);
  log.warn(`Default password: ${c.bold(SUPER_ADMIN.password)}  — change this immediately!`);
}

/* ─── master vaccine catalog ─── */
const VACCINES = [
  { name: "COVID-19 (Covishield)",     type: "covid19",     manufacturer: "Serum Institute of India",  dosesRequired: 2, description: "AstraZeneca/Oxford COVID-19 vaccine" },
  { name: "COVID-19 (Covaxin)",        type: "covid19",     manufacturer: "Bharat Biotech",            dosesRequired: 2, description: "India's indigenous inactivated COVID-19 vaccine" },
  { name: "Influenza (Fluzone HD)",    type: "influenza",   manufacturer: "Sanofi Pasteur",            dosesRequired: 1, description: "High-dose seasonal influenza vaccine" },
  { name: "Hepatitis B (Engerix-B)",   type: "hepatitisB",  manufacturer: "GlaxoSmithKline",           dosesRequired: 3, description: "Recombinant Hepatitis B surface antigen vaccine" },
  { name: "Hepatitis A (Havrix)",      type: "hepatitisA",  manufacturer: "GlaxoSmithKline",           dosesRequired: 2, description: "Inactivated Hepatitis A virus vaccine" },
  { name: "Typhoid (Typbar-TCV)",      type: "typhoid",     manufacturer: "Bharat Biotech",            dosesRequired: 1, description: "Typhoid Conjugate Vaccine — single dose protection" },
  { name: "HPV (Gardasil 9)",          type: "hpv",         manufacturer: "Merck",                     dosesRequired: 2, description: "Protects against 9 HPV strains" },
  { name: "MMR (M-M-R II)",            type: "mmr",         manufacturer: "Merck",                     dosesRequired: 2, description: "Measles, Mumps & Rubella combination vaccine" },
  { name: "Varicella (Varivax)",       type: "varicella",   manufacturer: "Merck",                     dosesRequired: 2, description: "Live attenuated chickenpox vaccine" },
  { name: "Rabies (Verorab)",          type: "rabies",      manufacturer: "Sanofi Pasteur",            dosesRequired: 3, description: "Pre/post-exposure rabies prophylaxis" },
];

/* ─── synthetic approved hospitals for patient demo ─── */
const DEMO_ADMIN_PASSWORD = "HospitalAdmin@123";
const SYNTHETIC_HOSPITALS = [
  {
    admin: { name: "Aarav Mehta", email: "admin.mumbai.central@vaxbook.in", phone: "+91-9000010001" },
    hospital: {
      name: "Mumbai Central Care Hospital",
      city: "Mumbai",
      pincode: "400001",
      address: "Marine Drive Road, Churchgate",
      registrationNumber: "MH-HOS-2021-00101",
    },
    inventory: [
      { vaccineName: "COVID-19 (Covishield)", stock: 350, available: 320, pricePerDose: 850 },
      { vaccineName: "Influenza (Fluzone HD)", stock: 180, available: 160, pricePerDose: 650 },
      { vaccineName: "Typhoid (Typbar-TCV)", stock: 160, available: 150, pricePerDose: 420 },
    ],
  },
  {
    admin: { name: "Ishita Rao", email: "admin.delhi.metro@vaxbook.in", phone: "+91-9000010002" },
    hospital: {
      name: "Delhi Metro Multispeciality",
      city: "New Delhi",
      pincode: "110001",
      address: "Connaught Place, Block C",
      registrationNumber: "DL-HOS-2022-00856",
    },
    inventory: [
      { vaccineName: "COVID-19 (Covaxin)", stock: 300, available: 280, pricePerDose: 900 },
      { vaccineName: "Hepatitis B (Engerix-B)", stock: 140, available: 120, pricePerDose: 500 },
      { vaccineName: "HPV (Gardasil 9)", stock: 90, available: 80, pricePerDose: 1900 },
    ],
  },
  {
    admin: { name: "Kiran Shetty", email: "admin.bengaluru.north@vaxbook.in", phone: "+91-9000010003" },
    hospital: {
      name: "Bengaluru North Health Centre",
      city: "Bengaluru",
      pincode: "560001",
      address: "MG Road Extension",
      registrationNumber: "KA-HOS-2023-01278",
    },
    inventory: [
      { vaccineName: "COVID-19 (Covishield)", stock: 260, available: 250, pricePerDose: 820 },
      { vaccineName: "MMR (M-M-R II)", stock: 120, available: 100, pricePerDose: 780 },
      { vaccineName: "Varicella (Varivax)", stock: 110, available: 95, pricePerDose: 1250 },
    ],
  },
  {
    admin: { name: "Nisha Reddy", email: "admin.hyderabad.east@vaxbook.in", phone: "+91-9000010004" },
    hospital: {
      name: "Hyderabad East Vaccination Hub",
      city: "Hyderabad",
      pincode: "500001",
      address: "Banjara Hills Road 7",
      registrationNumber: "TS-HOS-2021-02031",
    },
    inventory: [
      { vaccineName: "Hepatitis A (Havrix)", stock: 150, available: 140, pricePerDose: 700 },
      { vaccineName: "Rabies (Verorab)", stock: 110, available: 100, pricePerDose: 980 },
      { vaccineName: "Influenza (Fluzone HD)", stock: 170, available: 150, pricePerDose: 640 },
    ],
  },
];

function addDaysISO(daysToAdd) {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split("T")[0];
}

function slotTemplate(dayOffset, priceAtDate) {
  const morningLimit = 25 + (dayOffset % 4) * 5;
  const afternoonLimit = 20 + (dayOffset % 3) * 5;
  return {
    sessions: [
      { name: "Morning", startTime: "09:00", endTime: "13:00", limit: morningLimit, booked: Math.min(10 + dayOffset, morningLimit - 2) },
      { name: "Afternoon", startTime: "14:00", endTime: "18:00", limit: afternoonLimit, booked: Math.min(6 + dayOffset, afternoonLimit - 2) },
    ],
    priceAtDate,
  };
}

async function seedVaccines(force) {
  log.section("Master Vaccine Catalog");

  if (force) {
    const { deletedCount } = await Vaccine.deleteMany({});
    if (deletedCount) log.warn(`Cleared ${deletedCount} existing vaccine entries (--force)`);
  }

  let created = 0;
  let skipped = 0;

  for (const v of VACCINES) {
    const exists = await Vaccine.findOne({ name: v.name });
    if (exists) { skipped++; log.skip(`Already exists: ${v.name}`); continue; }
    await Vaccine.create(v);
    log.ok(`Vaccine: ${c.cyan(v.name)}  ${c.dim(`— ${v.manufacturer}`)}`);
    created++;
  }

  log.info(`${c.green(created)} created, ${c.dim(skipped + " skipped")}`);
}

async function seedSyntheticHospitalNetwork(force) {
  log.section("Synthetic Hospital Admin Network");

  if (force) {
    const demoAdminEmails = SYNTHETIC_HOSPITALS.map((s) => s.admin.email);
    const demoAdmins = await User.find({ email: { $in: demoAdminEmails }, role: "hospital_admin" }, "_id");
    const demoAdminIds = demoAdmins.map((a) => a._id);

    if (demoAdminIds.length) {
      const demoHospitals = await Hospital.find({ adminId: { $in: demoAdminIds } }, "_id");
      const demoHospitalIds = demoHospitals.map((h) => h._id);

      if (demoHospitalIds.length) {
        await Promise.all([
          HospitalVaccine.deleteMany({ hospitalId: { $in: demoHospitalIds } }),
          VaccineSlotDay.deleteMany({ hospitalId: { $in: demoHospitalIds } }),
          HospitalAdminVerification.deleteMany({ hospitalId: { $in: demoHospitalIds } }),
          Hospital.deleteMany({ _id: { $in: demoHospitalIds } }),
        ]);
      }

      await User.deleteMany({ _id: { $in: demoAdminIds } });
      log.warn("Removed existing synthetic hospital-admin network (--force)");
    }
  }

  const vaccineDocs = await Vaccine.find({}, "_id name");
  const vaccineByName = new Map(vaccineDocs.map((v) => [v.name, v]));
  const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, env.bcryptSaltRounds || 10);

  let createdAdmins = 0;
  let seededHospitals = 0;
  let seededInventoryRows = 0;
  let seededSlotDocs = 0;

  for (const item of SYNTHETIC_HOSPITALS) {
    let admin = await User.findOne({ email: item.admin.email, role: "hospital_admin" });
    if (!admin) {
      admin = await User.create({
        name: item.admin.name,
        email: item.admin.email,
        passwordHash,
        role: "hospital_admin",
        phone: item.admin.phone,
        isActive: true,
      });
      createdAdmins++;
      log.ok(`Hospital admin: ${c.cyan(item.admin.email)}`);
    } else {
      log.skip(`Hospital admin exists: ${item.admin.email}`);
    }

    let hospital = await Hospital.findOne({ adminId: admin._id });
    if (!hospital) {
      hospital = await Hospital.create({
        ...item.hospital,
        adminId: admin._id,
        onboardingStatus: "approved",
        isLive: true,
      });
      seededHospitals++;
    } else {
      hospital.name = item.hospital.name;
      hospital.city = item.hospital.city;
      hospital.pincode = item.hospital.pincode;
      hospital.address = item.hospital.address;
      hospital.registrationNumber = item.hospital.registrationNumber;
      hospital.onboardingStatus = "approved";
      hospital.isLive = true;
      await hospital.save();
    }

    if (!admin.hospitalId || String(admin.hospitalId) !== String(hospital._id)) {
      admin.hospitalId = hospital._id;
      await admin.save();
    }

    await HospitalAdminVerification.findOneAndUpdate(
      { hospitalAdminId: admin._id },
      {
        $set: {
          hospitalId: hospital._id,
          hospitalRegistrationNumber: hospital.registrationNumber,
          documentsSubmitted: true,
          adminIdProofUrl: "https://example.com/demo/admin-id-proof.pdf",
          registrationCertificateUrl: "https://example.com/demo/registration-certificate.pdf",
          status: "approved",
          reviewNotes: "Auto-approved synthetic seed data",
        },
      },
      { upsert: true, new: true }
    );

    for (const inv of item.inventory) {
      const vaccine = vaccineByName.get(inv.vaccineName);
      if (!vaccine) {
        log.warn(`Missing vaccine in catalog: ${inv.vaccineName}`);
        continue;
      }

      await HospitalVaccine.findOneAndUpdate(
        { hospitalId: hospital._id, vaccineId: vaccine._id },
        {
          $set: {
            totalStock: inv.stock,
            availableStock: inv.available,
            pricePerDose: inv.pricePerDose,
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
      seededInventoryRows++;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = addDaysISO(dayOffset);
        const slotData = slotTemplate(dayOffset, inv.pricePerDose);
        await VaccineSlotDay.findOneAndUpdate(
          { hospitalId: hospital._id, vaccineId: vaccine._id, date },
          {
            $set: {
              sessions: slotData.sessions,
              priceAtDate: slotData.priceAtDate,
              isActive: true,
            },
            $setOnInsert: {
              hospitalId: hospital._id,
              vaccineId: vaccine._id,
              date,
            },
          },
          { upsert: true, new: true }
        );
        seededSlotDocs++;
      }
    }
  }

  log.info(`${c.green(createdAdmins)} admins created, ${c.green(seededHospitals)} hospitals created/updated`);
  log.info(`${c.green(seededInventoryRows)} inventory rows seeded, ${c.green(seededSlotDocs)} slot docs seeded`);
  log.warn(`Demo hospital admin password: ${c.bold(DEMO_ADMIN_PASSWORD)}`);
}

/* ─── seed govt registry ─── */
async function seedGovtRegistry(force) {
  log.section("Government Hospital Registry");

  if (force) {
    const { deletedCount } = await GovtHospitalRegistry.deleteMany({});
    if (deletedCount) log.warn(`Cleared ${deletedCount} existing registry entries (--force)`);
  }

  let created = 0;
  let skipped = 0;

  for (const entry of GOVT_HOSPITALS) {
    const exists = await GovtHospitalRegistry.findOne({
      registrationNumber: entry.registrationNumber,
    });

    if (exists) {
      skipped++;
      log.skip(`Already exists: ${entry.registrationNumber}`);
      continue;
    }

    await GovtHospitalRegistry.create(entry);
    log.ok(`Registered: ${c.cyan(entry.registrationNumber)}  ${c.dim(`— ${entry.hospitalName}`)}`);
    created++;
  }

  log.info(`${c.green(created)} created, ${c.dim(skipped + " skipped")}`);
}

/* ─── main ─── */
async function main() {
  const force = process.argv.includes("--force");

  console.log(c.bold("\n╔══════════════════════════════════╗"));
  console.log(c.bold("║       VaxBook  — DB  Seeder      ║"));
  console.log(c.bold("╚══════════════════════════════════╝"));
  if (force) log.warn("Running in --force mode: existing seed data will be replaced.");

  log.section("Connecting to MongoDB…");
  await connectDB();
  log.ok(`Connected  →  ${c.dim(env.mongoUri)}`);

  await seedSuperAdmin(force);
  await seedGovtRegistry(force);
  await seedVaccines(force);
  await seedSyntheticHospitalNetwork(force);

  console.log(c.bold("\n✅  Seed complete.\n"));
  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  log.error(err.message ?? err);
  process.exit(1);
});
