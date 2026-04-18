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

  console.log(c.bold("\n✅  Seed complete.\n"));
  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  log.error(err.message ?? err);
  process.exit(1);
});
