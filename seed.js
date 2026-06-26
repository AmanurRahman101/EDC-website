const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dummyProducts = [
    {
      name: 'M-01 FOLDER',
      description: 'STONEWASHED TITANIUM. Premium S35VN steel blade with ceramic bearings.',
      price: 285.00,
      stock: 15,
      image: 'assets/titanium_folding_knife.png',
      status: 'LIMITED_RUN',
      category: 'KNIVES',
    },
    {
      name: 'L-02 BEACON',
      description: 'HARD ANODIZED BLACK. 1000 lumen output with deep carry pocket clip.',
      price: 145.00,
      stock: 50,
      image: 'assets/tactical_flashlight.png',
      status: 'IN_STOCK',
      category: 'LIGHTS',
    },
    {
      name: 'T-04 PRY',
      description: 'RAW TITANIUM. Essential daily pry tool with integrated bottle opener.',
      price: 85.00,
      stock: 0,
      image: 'assets/titanium_pry_bar.png',
      status: 'BACKORDERED',
      category: 'TOOLS',
    },
    {
      name: 'P-01 BOLT',
      description: 'MACHINED BRASS. Bolt-action mechanism pen, takes Parker style refills.',
      price: 95.00,
      stock: 32,
      image: 'assets/titanium_pry_bar.png', // using existing placeholder
      status: 'IN_STOCK',
      category: 'PENS',
    },
    {
      name: 'M-02 MINI',
      description: 'CARBON FIBER SCALES. Compact everyday carry folder under 2 inches.',
      price: 180.00,
      stock: 8,
      image: 'assets/titanium_folding_knife.png', // using existing placeholder
      status: 'IN_STOCK',
      category: 'KNIVES',
    },
    {
      name: 'L-03 MICRO',
      description: 'COPPER PATINA. Keychain light pushing 300 lumens, USB-C rechargeable.',
      price: 65.00,
      stock: 110,
      image: 'assets/tactical_flashlight.png', // using existing placeholder
      status: 'IN_STOCK',
      category: 'LIGHTS',
    },
    {
      name: 'T-05 BIT DRIVER',
      description: 'MAGNETIC TITANIUM. Precision 1/4" hex bit driver with knurled grip.',
      price: 120.00,
      stock: 4,
      image: 'assets/titanium_pry_bar.png', // using existing placeholder
      status: 'LIMITED_RUN',
      category: 'TOOLS',
    },
    {
      name: 'P-02 CLICK',
      description: 'ZIRCONIUM. Silent click mechanism, perfectly balanced weight distribution.',
      price: 210.00,
      stock: 0,
      image: 'assets/titanium_pry_bar.png', // using existing placeholder
      status: 'BACKORDERED',
      category: 'PENS',
    }
  ];

  for (const product of dummyProducts) {
    await prisma.product.create({ data: product });
  }

  console.log('Seeded database with dummy catalog!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
