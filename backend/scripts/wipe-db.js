import 'dotenv/config';
import prisma from '../lib/prisma.js';

const rawArgs = process.argv.slice(2);
const APPLY = rawArgs.includes('--apply');
const VERBOSE = rawArgs.includes('--verbose');

function log(...args){ if(VERBOSE) console.log(...args); }

async function counts(){
  return {
    appointments: await prisma.appointment.count(),
    prescriptions: await prisma.prescription.count(),
    medicalRecords: await prisma.medicalRecord.count(),
    pets: await prisma.pet.count(),
    tutors: await prisma.tutor.count(),
    availability: await prisma.availability.count(),
    subscriptions: await prisma.subscription.count(),
    professionals: await prisma.professional.count(),
    users: await prisma.user.count(),
  }
}

async function dryRun(){
  console.log('\nDB WIPE DRY-RUN (no changes)');
  const c = await counts();
  console.table(c);
}

async function apply(){
  console.log('\nApplying DB wipe (destructive)');
  // Delete in order to respect FK constraints
  console.log('Deleting appointments...');
  await prisma.appointment.deleteMany({});
  console.log('Deleting prescriptions...');
  await prisma.prescription.deleteMany({});
  console.log('Deleting medicalRecords...');
  await prisma.medicalRecord.deleteMany({});
  console.log('Deleting pets...');
  await prisma.pet.deleteMany({});
  console.log('Deleting tutors...');
  await prisma.tutor.deleteMany({});
  console.log('Deleting availability...');
  await prisma.availability.deleteMany({});
  console.log('Deleting subscriptions...');
  await prisma.subscription.deleteMany({});
  console.log('Deleting professionals...');
  await prisma.professional.deleteMany({});
  console.log('Deleting users (will keep admin if you need) ...');
  // If you want to preserve a specific admin user, change this to deleteMany with filter
  await prisma.user.deleteMany({});
  console.log('Wipe applied.');
}

async function main(){
  try{
    await dryRun();
    if(APPLY){
      // second dry run before applying
      const before = await counts();
      console.log('\nCounts before apply:');
      console.table(before);
      await apply();
      const after = await counts();
      console.log('\nCounts after apply:');
      console.table(after);
    } else {
      console.log('\nTo perform the wipe run: node scripts/wipe-db.js --apply');
    }
  } catch(e){
    console.error('Error running wipe:', e);
  } finally{
    await prisma.$disconnect();
  }
}

main();
