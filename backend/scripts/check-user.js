import 'dotenv/config';
import prisma from '../lib/prisma.js';

async function main(){
  const user = await prisma.user.findUnique({ where: { email: 'smoke+test@example.com' } });
  console.log(user);
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
