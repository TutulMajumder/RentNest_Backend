import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import config from "../src/config";
import { Role } from "../generated/prisma/enums";

const ADMIN_EMAIL = "superadmin@rentnest.com";
const ADMIN_PASSWORD = "admin123";

const main = async () => {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log("Admin already exists, skipping seed");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    ADMIN_PASSWORD,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.create({
    data: {
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin seeded: ${ADMIN_EMAIL}`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
