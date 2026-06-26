import "dotenv/config";
import { PrismaClient, ProductStatus, Role } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data in dev (order matters for relations)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Categories
  const knives = await prisma.category.create({
    data: { slug: "knives", name: "KNIVES" },
  });
  const tools = await prisma.category.create({
    data: { slug: "tools", name: "TOOLS" },
  });
  const lights = await prisma.category.create({
    data: { slug: "lights", name: "LIGHTS" },
  });

  // Admin user — credentials come from env vars; fall back to random
  // password so the seed never ships a guessable default.
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@machinededc.com";
  const adminPass  = process.env.SEED_ADMIN_PASSWORD || crypto.randomUUID();
  const adminPassword = await bcrypt.hash(adminPass, 10);
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Sample customer (optional)
  const custEmail = process.env.SEED_CUSTOMER_EMAIL || "user@example.com";
  const custPass  = process.env.SEED_CUSTOMER_PASSWORD || crypto.randomUUID();
  const customerPass = await bcrypt.hash(custPass, 10);
  await prisma.user.create({
    data: {
      email: custEmail,
      name: "Alex Rivera",
      passwordHash: customerPass,
      role: Role.CUSTOMER,
    },
  });

  // Product 1: Knife
  const knife = await prisma.product.create({
    data: {
      slug: "m-01-folder",
      name: "M-01 FOLDER",
      subtitle: "STONEWASHED TITANIUM",
      description:
        "Meticulously machined titanium folding knife. Grade 5 titanium handle with stonewashed M390 blade. Ultra-precise fit and finish, built for a lifetime of carry.",
      priceCents: 2850000, // ৳28,500
      status: ProductStatus.LIMITED_RUN,
      stock: 12,
      featured: true,
      categoryId: knives.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: knife.id,
      url: "/products/titanium_folding_knife.png",
      alt: "M-01 Folder stonewashed titanium folding knife",
      position: 0,
    },
  });

  await prisma.productSpec.createMany({
    data: [
      { productId: knife.id, label: "BLADE_STEEL", value: "M390", position: 0 },
      { productId: knife.id, label: "WEIGHT", value: "3.2_OZ", position: 1 },
      { productId: knife.id, label: "HANDLE", value: "TI_6AL_4V", position: 2 },
      { productId: knife.id, label: "LOCK", value: "FRAME_LOCK", position: 3 },
    ],
  });

  // Product 2: Light
  const light = await prisma.product.create({
    data: {
      slug: "l-02-beacon",
      name: "L-02 BEACON",
      subtitle: "HARD ANODIZED BLACK",
      description:
        "Tactical EDC flashlight machined from 6061-T6 aluminum with type-III hard anodize. 1200 lumens, IPX8 rated, runs on single 18650.",
      priceCents: 1450000, // ৳14,500
      status: ProductStatus.IN_STOCK,
      stock: 47,
      featured: true,
      categoryId: lights.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: light.id,
      url: "/products/tactical_flashlight.png",
      alt: "L-02 Beacon hard anodized black tactical flashlight",
      position: 0,
    },
  });

  await prisma.productSpec.createMany({
    data: [
      { productId: light.id, label: "OUTPUT", value: "1200_LM", position: 0 },
      { productId: light.id, label: "BATTERY", value: "18650", position: 1 },
      { productId: light.id, label: "MATERIAL", value: "6061_AL", position: 2 },
      { productId: light.id, label: "WEIGHT", value: "4.8_OZ", position: 3 },
    ],
  });

  // Product 3: Pry
  const pry = await prisma.product.create({
    data: {
      slug: "t-04-pry",
      name: "T-04 PRY",
      subtitle: "RAW TITANIUM",
      description:
        "Compact titanium multi-tool pry bar. Precision machined from raw Ti-6Al-4V. Perfect for everyday leverage tasks.",
      priceCents: 850000, // ৳8,500
      status: ProductStatus.BACKORDERED,
      stock: 0,
      featured: false,
      categoryId: tools.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: pry.id,
      url: "/products/titanium_pry_bar.png",
      alt: "T-04 Pry raw titanium multi-tool pry bar",
      position: 0,
    },
  });

  await prisma.productSpec.createMany({
    data: [
      { productId: pry.id, label: "MATERIAL", value: "TI_6AL_4V", position: 0 },
      { productId: pry.id, label: "LENGTH", value: "4.5_IN", position: 1 },
      { productId: pry.id, label: "WEIGHT", value: "1.8_OZ", position: 2 },
    ],
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail}`);
  console.log(`Customer: ${custEmail}`);
  console.log("(Passwords were read from SEED_ADMIN_PASSWORD / SEED_CUSTOMER_PASSWORD env vars, or generated randomly.)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
