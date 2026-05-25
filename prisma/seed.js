const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  await prisma.business.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.lostFoundDetail.deleteMany({});
  await prisma.alertDetail.deleteMany({});
  await prisma.eventDetail.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.locality.deleteMany({});

  console.log("Seeding localities...");
  
  const badlapur = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: null,
      city: "Thane",
      state: "Maharashtra",
      pincode: "421503",
      lat: 19.1498,
      lng: 73.2422,
    }
  });

  const katrap = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Katrap",
      city: "Thane",
      state: "Maharashtra",
      pincode: "421503",
      lat: 19.1550,
      lng: 73.2500,
    }
  });

  const shirgaon = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Shirgaon",
      city: "Thane",
      state: "Maharashtra",
      pincode: "421503",
      lat: 19.1620,
      lng: 73.2380,
    }
  });

  console.log("Seeding users...");

  const pranav = await prisma.user.create({
    data: {
      name: "Pranav",
      phone: "9876543210",
      email: "pranav@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pranav",
      role: "admin",
      localityId: katrap.id,
    }
  });

  const aarav = await prisma.user.create({
    data: {
      name: "Aarav",
      phone: "9876543211",
      email: "aarav@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
      role: "member",
      localityId: shirgaon.id,
    }
  });

  const ananya = await prisma.user.create({
    data: {
      name: "Ananya",
      phone: "9876543212",
      email: "ananya@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      role: "moderator",
      localityId: katrap.id,
    }
  });

  const rajesh = await prisma.user.create({
    data: {
      name: "Rajesh",
      phone: "9876543213",
      email: "rajesh@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
      role: "member",
      localityId: shirgaon.id,
    }
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya",
      phone: "9876543214",
      email: "priya@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      role: "member",
      localityId: katrap.id,
    }
  });

  console.log("Seeding posts and details...");

  // Post 1: Alert (Ananya -> Katrap)
  const post1 = await prisma.post.create({
    data: {
      userId: ananya.id,
      localityId: katrap.id,
      title: "Scheduled Power Cut on Wednesday in Katrap",
      content: "MSEDCL has announced a scheduled power outage in the Katrap area on Wednesday from 10:00 AM to 5:00 PM for maintenance work. Please plan accordingly.",
      category: "alert",
    }
  });
  await prisma.alertDetail.create({
    data: {
      postId: post1.id,
      severity: "warning",
      expiresAt: new Date("2026-05-28T00:00:00Z"),
    }
  });

  // Post 2: Announcement (Aarav -> Katrap)
  const post2 = await prisma.post.create({
    data: {
      userId: aarav.id,
      localityId: katrap.id,
      title: "Society Annual General Meeting scheduled for next Sunday",
      content: "Dear residents, the AGM of Katrap Heights Co-operative Housing Society is scheduled for next Sunday at 10:30 AM in the clubhouse. Attendance is mandatory.",
      category: "announcement",
    }
  });

  // Post 3: Event (Pranav -> Shirgaon)
  const post3 = await prisma.post.create({
    data: {
      userId: pranav.id,
      localityId: shirgaon.id,
      title: "Badlapur Premier League Cricket Tournament",
      content: "Cricket enthusiasts! The annual BPL tournament starts this Friday at the Shirgaon Ground. Come support your local neighborhood teams!",
      category: "event",
    }
  });
  await prisma.eventDetail.create({
    data: {
      postId: post3.id,
      eventDate: new Date("2026-05-29T09:00:00Z"),
      location: "Shirgaon Sports Ground, Badlapur East",
    }
  });

  // Post 4: Event (Ananya -> Katrap)
  const post4 = await prisma.post.create({
    data: {
      userId: ananya.id,
      localityId: katrap.id,
      title: "Cleanliness Drive in Katrap Lake Garden",
      content: "Join us this Sunday morning at 7:30 AM for a neighborhood cleanup drive. Let's make Katrap green and clean. Garbage bags and gloves will be provided.",
      category: "event",
    }
  });
  await prisma.eventDetail.create({
    data: {
      postId: post4.id,
      eventDate: new Date("2026-05-31T07:30:00Z"),
      location: "Katrap Lake Garden, Badlapur East",
    }
  });

  // Post 5: Lost & Found (Aarav -> Shirgaon)
  const post5 = await prisma.post.create({
    data: {
      userId: aarav.id,
      localityId: shirgaon.id,
      title: "Lost key bunch near Shirgaon station road",
      content: "Lost a ring of 4 keys with a blue keychain on Shirgaon station road yesterday evening. If found, please contact me.",
      category: "lost_found",
    }
  });
  await prisma.lostFoundDetail.create({
    data: {
      postId: post5.id,
      type: "lost",
      itemName: "Key bunch with blue keychain",
      reward: "Cup of hot tea at Yadav Chai",
      status: "open",
    }
  });

  // Post 6: Lost & Found (Pranav -> Katrap)
  const post6 = await prisma.post.create({
    data: {
      userId: pranav.id,
      localityId: katrap.id,
      title: "Found a golden retriever puppy near Katrap park",
      content: "Found a young golden retriever puppy wandering near Katrap park. He is wearing a red collar but has no tag. Extremely friendly. Safe with me for now.",
      category: "lost_found",
    }
  });
  await prisma.lostFoundDetail.create({
    data: {
      postId: post6.id,
      type: "found",
      itemName: "Golden Retriever Puppy (Red Collar)",
      reward: null,
      status: "open",
    }
  });

  // Post 7: Buy/Sell (Rajesh -> Katrap)
  const post7 = await prisma.post.create({
    data: {
      userId: rajesh.id,
      localityId: katrap.id,
      title: "Second-hand study table for sale",
      content: "Selling a wooden study table in excellent condition. Dimensions: 3ft x 2ft, has 2 drawers and a keyboard tray. Asking price: ₹1500. Pick up from Katrap.",
      category: "buy_sell",
    }
  });

  // Post 8: Buy/Sell (Priya -> Katrap)
  const post8 = await prisma.post.create({
    data: {
      userId: priya.id,
      localityId: katrap.id,
      title: "Acoustic guitar in excellent condition",
      content: "Yamaha F310 acoustic guitar up for grabs. Rarely used, sounds beautiful, and comes with a padded gig bag and picks. Price: ₹5000. Katrap area.",
      category: "buy_sell",
    }
  });

  // Post 9: Question (Pranav -> Shirgaon)
  const post9 = await prisma.post.create({
    data: {
      userId: pranav.id,
      localityId: shirgaon.id,
      title: "Any good maid recommendations in Shirgaon?",
      content: "Hi all, looking for a reliable helper/maid for cooking and cleaning in Shirgaon area. Any trusted recommendations? Thanks in advance!",
      category: "question",
    }
  });

  // Post 10: Question (Aarav -> Katrap)
  const post10 = await prisma.post.create({
    data: {
      userId: aarav.id,
      localityId: katrap.id,
      title: "Is the railway crossing open near Katrap bypass?",
      content: "Can anyone confirm if the railway crossing near Katrap bypass is currently open or blocked for construction? Need to plan my commute.",
      category: "question",
    }
  });

  // Post 11: Service (Rajesh -> Badlapur)
  const post11 = await prisma.post.create({
    data: {
      userId: rajesh.id,
      localityId: badlapur.id,
      title: "Dynamic Electricians & Plumbers available for hire",
      content: "We offer professional electric wiring, plumbing, leakage detection, and home repair services across Badlapur. Quick response and affordable rates.",
      category: "service",
    }
  });

  console.log("Seeding likes and comments...");

  // Likes
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: pranav.id,
    }
  });

  await prisma.like.create({
    data: {
      postId: post3.id,
      userId: aarav.id,
    }
  });

  await prisma.like.create({
    data: {
      postId: post4.id,
      userId: pranav.id,
    }
  });

  // Comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: pranav.id,
      content: "Thanks for the heads up, Ananya! Let me charge my powerbanks.",
    }
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: rajesh.id,
      content: "Is this going to affect Shirgaon too, or is it only restricted to Katrap?",
    }
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: ananya.id,
      content: "As per the MSEDCL circular, it is only for Katrap feeders. Shirgaon should be fine.",
    }
  });

  await prisma.comment.create({
    data: {
      postId: post5.id,
      userId: ananya.id,
      content: "Hope you find them soon, Aarav. Have you checked near the tea stall?",
    }
  });

  await prisma.comment.create({
    data: {
      postId: post7.id,
      userId: rajesh.id,
      content: "Is the price negotiable? I am looking for my son.",
    }
  });

  console.log("Seeding groups and memberships...");

  // Group 1
  const group1 = await prisma.group.create({
    data: {
      name: "Katrap Residents Association",
      description: "A group for residents of Katrap to discuss local developments, civic issues, and cultural events.",
      category: "locality",
      localityId: katrap.id,
      createdBy: ananya.id,
    }
  });

  await prisma.groupMember.createMany({
    data: [
      { groupId: group1.id, userId: ananya.id, role: "admin" },
      { groupId: group1.id, userId: pranav.id, role: "member" },
      { groupId: group1.id, userId: aarav.id, role: "member" },
      { groupId: group1.id, userId: rajesh.id, role: "member" },
    ]
  });

  // Group 2
  const group2 = await prisma.group.create({
    data: {
      name: "Badlapur Cycling Club",
      description: "For fitness enthusiasts and cycling lovers in Badlapur. Join us for weekend morning rides to nearby dams and spots.",
      category: "interest",
      localityId: badlapur.id,
      createdBy: pranav.id,
    }
  });

  await prisma.groupMember.createMany({
    data: [
      { groupId: group2.id, userId: pranav.id, role: "admin" },
      { groupId: group2.id, userId: aarav.id, role: "member" },
      { groupId: group2.id, userId: ananya.id, role: "member" },
    ]
  });

  // Group 3
  const group3 = await prisma.group.create({
    data: {
      name: "Shirgaon Sports League",
      description: "Connecting sports lovers in Shirgaon. Planning turf cricket, football matches, and seasonal tournaments.",
      category: "events",
      localityId: shirgaon.id,
      createdBy: aarav.id,
    }
  });

  await prisma.groupMember.createMany({
    data: [
      { groupId: group3.id, userId: aarav.id, role: "admin" },
      { groupId: group3.id, userId: pranav.id, role: "member" },
      { groupId: group3.id, userId: rajesh.id, role: "member" },
    ]
  });

  console.log("Seeding businesses...");

  await prisma.business.create({
    data: {
      name: "Priya Medical Store",
      category: "medical",
      description: "All prescription medicines, baby care products, health supplements and wellness items available. Home delivery in Katrap.",
      phone: "9876543214",
      address: "Shop No. 3, Katrap Road, Badlapur East",
      localityId: katrap.id,
      rating: 4.8,
    }
  });

  await prisma.business.create({
    data: {
      name: "Rajesh Grocers",
      category: "groceries",
      description: "Daily fresh grains, pulses, dairy products, spices, and general household essentials. Best wholesale rates in Badlapur.",
      phone: "9876543213",
      address: "Shivaji Chowk, Shirgaon Road, Badlapur East",
      localityId: shirgaon.id,
      rating: 4.6,
    }
  });

  await prisma.business.create({
    data: {
      name: "Badlapur Electric Repair",
      category: "electrician",
      description: "Repairs for all home appliances, wiring, fans, geysers, and emergency electric faults. Reliable local service.",
      phone: "9876543220",
      address: "Station Area, Badlapur West",
      localityId: badlapur.id,
      rating: 4.5,
    }
  });

  await prisma.business.create({
    data: {
      name: "Katrap Plumbing Services",
      category: "plumber",
      description: "Leaks, water tank cleaning, blockage cleaning, pipe replacement, and bathroom fittings. Fast emergency visits.",
      phone: "9876543221",
      address: "Katrap Bypass Road, Badlapur East",
      localityId: katrap.id,
      rating: 4.7,
    }
  });

  await prisma.business.create({
    data: {
      name: "Badlapur Fast Bites",
      category: "restaurant",
      description: "Vada Pav, Misal Pav, Sabudana Khichdi, and authentic Maharashtrian snacks. Freshly prepared, hygienic and tasty.",
      phone: "9876543222",
      address: "Gandhi Chowk, Badlapur East",
      localityId: badlapur.id,
      rating: 4.9,
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
