/*
|--------------------------------------------------------------------------
| ユーザーデータ作成
|--------------------------------------------------------------------------
*/
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL;
  const name = process.env.NAME;
  const password = process.env.PASSWORD;

  if (!email || !name || !password) {
    console.error("Environment variables EMAIL, NAME, or PASSWORD are not set");
    process.exit(1);
  }

  await prisma.user.create({
    data: {
      email: email,
      name: name,
      password: password,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
