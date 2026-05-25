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
  
  // Parent localities (with isSelectable: false)
  const badlapurParent = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: null,
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      pincode: "421503",
      isSelectable: false,
      groupName: "Badlapur Localities",
    }
  });

  const kalyanParent = await prisma.locality.create({
    data: {
      name: "Kalyan",
      subArea: null,
      city: "Kalyan",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "kalyan",
      pincode: "421301",
      isSelectable: false,
      groupName: "Nearby Areas",
    }
  });

  const dombivliParent = await prisma.locality.create({
    data: {
      name: "Dombivli",
      subArea: null,
      city: "Dombivli",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "dombivli",
      pincode: "421202",
      isSelectable: false,
      groupName: "Central Line Areas",
    }
  });

  const ulhasnagarParent = await prisma.locality.create({
    data: {
      name: "Ulhasnagar",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      pincode: "421001",
      isSelectable: false,
      groupName: "Nearby Areas",
    }
  });

  const ambernathParent = await prisma.locality.create({
    data: {
      name: "Ambernath",
      subArea: null,
      city: "Ambernath",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ambernath",
      pincode: "421501",
      isSelectable: false,
      groupName: "Nearby Areas",
    }
  });

  // Badlapur selectable sub-localities
  const katrap = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Katrap",
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1550,
      lng: 73.2500,
      groupName: "Badlapur Localities",
      searchKeywords: "katrap station, badlapur station, katrap park, pipeline road, sector 3",
    }
  });

  const shirgaon = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Shirgaon",
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1620,
      lng: 73.2380,
      groupName: "Badlapur Localities",
      searchKeywords: "shirgaon station, badlapur station, shirgaon ground, shivaji chowk",
    }
  });

  const kulgaon = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Kulgaon",
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1440,
      lng: 73.2280,
      groupName: "Badlapur Localities",
      searchKeywords: "kulgaon badlapur, kulgaon station, badlapur west",
    }
  });

  const rameshwadi = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Rameshwadi",
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1520,
      lng: 73.2250,
      groupName: "Badlapur Localities",
      searchKeywords: "rameshwadi badlapur, rameshwadi station road",
    }
  });

  const belavali = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Belavali",
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1380,
      lng: 73.2340,
      groupName: "Badlapur Localities",
      searchKeywords: "belavali badlapur, belavali west",
    }
  });

  const manjarli = await prisma.locality.create({
    data: {
      name: "Badlapur",
      subArea: "Manjarli",
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1650,
      lng: 73.2200,
      groupName: "Badlapur Localities",
      searchKeywords: "manjarli badlapur, manjarli bridge",
    }
  });

  const badlapurEast = await prisma.locality.create({
    data: {
      name: "Badlapur East",
      subArea: null,
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1500,
      lng: 73.2450,
      groupName: "Badlapur Localities",
      searchKeywords: "badlapur east station, badlapur station, katrap bypass, gandhi chowk",
    }
  });

  const badlapurWest = await prisma.locality.create({
    data: {
      name: "Badlapur West",
      subArea: null,
      city: "Badlapur",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "badlapur",
      parentSlug: "badlapur",
      parentLocalityId: badlapurParent.id,
      isSelectable: true,
      pincode: "421503",
      lat: 19.1450,
      lng: 73.2300,
      groupName: "Badlapur Localities",
      searchKeywords: "badlapur west station, station road badlapur west, belavali",
    }
  });

  // Kalyan selectable sub-localities
  const kalyanEast = await prisma.locality.create({
    data: {
      name: "Kalyan East",
      subArea: null,
      city: "Kalyan",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "kalyan",
      parentSlug: "kalyan",
      parentLocalityId: kalyanParent.id,
      isSelectable: true,
      pincode: "421306",
      lat: 19.2300,
      lng: 73.1400,
      groupName: "Nearby Areas",
      searchKeywords: "kalyan east station, lokgram, pisavali, chinchpada",
    }
  });

  const kalyanWest = await prisma.locality.create({
    data: {
      name: "Kalyan West",
      subArea: null,
      city: "Kalyan",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "kalyan",
      parentSlug: "kalyan",
      parentLocalityId: kalyanParent.id,
      isSelectable: true,
      pincode: "421301",
      lat: 19.2402,
      lng: 73.1302,
      groupName: "Nearby Areas",
      searchKeywords: "kalyan west station, station road kalyan, lal chowki, syndicate",
    }
  });

  const shahad = await prisma.locality.create({
    data: {
      name: "Shahad",
      subArea: null,
      city: "Kalyan",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "kalyan",
      parentSlug: "kalyan",
      parentLocalityId: kalyanParent.id,
      isSelectable: true,
      pincode: "421103",
      lat: 19.2510,
      lng: 73.1450,
      groupName: "Nearby Areas",
      searchKeywords: "shahad station, shahad kalyan, birla mandir, Century Rayon",
    }
  });

  const khadakpada = await prisma.locality.create({
    data: {
      name: "Kalyan",
      subArea: "Khadakpada",
      city: "Kalyan",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "kalyan",
      parentSlug: "kalyan",
      parentLocalityId: kalyanParent.id,
      isSelectable: true,
      pincode: "421301",
      lat: 19.2580,
      lng: 73.1390,
      groupName: "Nearby Areas",
      searchKeywords: "khadakpada kalyan, khadakpada chowk, birla college road",
    }
  });

  const chikanGhar = await prisma.locality.create({
    data: {
      name: "Kalyan",
      subArea: "Chikan Ghar",
      city: "Kalyan",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "kalyan",
      parentSlug: "kalyan",
      parentLocalityId: kalyanParent.id,
      isSelectable: true,
      pincode: "421301",
      lat: 19.2500,
      lng: 73.1320,
      groupName: "Nearby Areas",
      searchKeywords: "chikan ghar kalyan, chikan ghar chowk, birla college",
    }
  });

  // Dombivli selectable sub-localities
  const dombivliEast = await prisma.locality.create({
    data: {
      name: "Dombivli East",
      subArea: null,
      city: "Dombivli",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "dombivli",
      parentSlug: "dombivli",
      parentLocalityId: dombivliParent.id,
      isSelectable: true,
      pincode: "421201",
      lat: 19.2183,
      lng: 73.0878,
      groupName: "Central Line Areas",
      searchKeywords: "dombivli east station, phadke road, manpada, ramnagar",
    }
  });

  const dombivliWest = await prisma.locality.create({
    data: {
      name: "Dombivli West",
      subArea: null,
      city: "Dombivli",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "dombivli",
      parentSlug: "dombivli",
      parentLocalityId: dombivliParent.id,
      isSelectable: true,
      pincode: "421202",
      lat: 19.2150,
      lng: 73.0750,
      groupName: "Central Line Areas",
      searchKeywords: "dombivli west station, gupte road, din dayal road, shastri nagar",
    }
  });

  const thakurli = await prisma.locality.create({
    data: {
      name: "Thakurli",
      subArea: null,
      city: "Dombivli",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "dombivli",
      parentSlug: "dombivli",
      parentLocalityId: dombivliParent.id,
      isSelectable: true,
      pincode: "421201",
      lat: 19.2240,
      lng: 73.1040,
      groupName: "Central Line Areas",
      searchKeywords: "thakurli station, thakurli east, thakurli west, 90 feet road",
    }
  });

  // Ulhasnagar selectable sub-localities
  const ulhasnagarCamp1 = await prisma.locality.create({
    data: {
      name: "Ulhasnagar Camp 1",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      parentSlug: "ulhasnagar",
      parentLocalityId: ulhasnagarParent.id,
      isSelectable: true,
      pincode: "421001",
      lat: 19.2215,
      lng: 73.1644,
      groupName: "Nearby Areas",
      searchKeywords: "ulhasnagar camp 1, camp 1 market, gol maidan, birla temple",
    }
  });

  const ulhasnagarCamp2 = await prisma.locality.create({
    data: {
      name: "Ulhasnagar Camp 2",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      parentSlug: "ulhasnagar",
      parentLocalityId: ulhasnagarParent.id,
      isSelectable: true,
      pincode: "421002",
      lat: 19.2200,
      lng: 73.1600,
      groupName: "Nearby Areas",
      searchKeywords: "ulhasnagar camp 2, camp 2 market, chowk",
    }
  });

  const ulhasnagarCamp3 = await prisma.locality.create({
    data: {
      name: "Ulhasnagar Camp 3",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      parentSlug: "ulhasnagar",
      parentLocalityId: ulhasnagarParent.id,
      isSelectable: true,
      pincode: "421003",
      lat: 19.2150,
      lng: 73.1550,
      groupName: "Nearby Areas",
      searchKeywords: "ulhasnagar camp 3, ulhasnagar station, camp 3 market, CHM college",
    }
  });

  const ulhasnagarCamp4 = await prisma.locality.create({
    data: {
      name: "Ulhasnagar Camp 4",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      parentSlug: "ulhasnagar",
      parentLocalityId: ulhasnagarParent.id,
      isSelectable: true,
      pincode: "421004",
      lat: 19.2100,
      lng: 73.1680,
      groupName: "Nearby Areas",
      searchKeywords: "ulhasnagar camp 4, camp 4 market, netaji chowk, maratha section",
    }
  });

  const ulhasnagarCamp5 = await prisma.locality.create({
    data: {
      name: "Ulhasnagar Camp 5",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      parentSlug: "ulhasnagar",
      parentLocalityId: ulhasnagarParent.id,
      isSelectable: true,
      pincode: "421005",
      lat: 19.2050,
      lng: 73.1750,
      groupName: "Nearby Areas",
      searchKeywords: "ulhasnagar camp 5, ot section, camp 5 market, Bhatia chowk",
    }
  });

  const vithalwadi = await prisma.locality.create({
    data: {
      name: "Vithalwadi",
      subArea: null,
      city: "Ulhasnagar",
      state: "Maharashtra",
      stateCode: "MH",
      citySlug: "ulhasnagar",
      parentSlug: "ulhasnagar",
      parentLocalityId: ulhasnagarParent.id,
      isSelectable: true,
      pincode: "421003",
      lat: 19.2260,
      lng: 73.1490,
      groupName: "Nearby Areas",
      searchKeywords: "vithalwadi station, vithalwadi ulhasnagar, vithalwadi bridge",
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

  // Post 11: Service (Rajesh -> Badlapur East)
  const post11 = await prisma.post.create({
    data: {
      userId: rajesh.id,
      localityId: badlapurEast.id,
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
      localityId: badlapurEast.id,
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
      name: "Priya Academy & Tutors",
      category: "tutor",
      description: "Personalized home tuitions and group classes for Mathematics, Science, and English. Grades 5-10. Excellent results.",
      phone: "9876543214",
      address: "Shop No. 3, Katrap Road, Badlapur East",
      localityId: katrap.id,
      rating: 4.9,
      isFeatured: true,
      leadsCount: 12,
    }
  });

  await prisma.business.create({
    data: {
      name: "Shirgaon Fitness Gym",
      category: "gym",
      description: "Modern fitness center with certified trainers, strength training equipment, and cardio section. Special packages.",
      phone: "9876543213",
      address: "Shivaji Chowk, Shirgaon Road, Badlapur East",
      localityId: shirgaon.id,
      rating: 4.7,
      isPromoted: true,
      leadsCount: 8,
    }
  });

  await prisma.business.create({
    data: {
      name: "Apex Electric Repair & Wiring",
      category: "electrician",
      description: "Repairs for all home appliances, wiring, fans, geysers, and emergency electric faults. Reliable local service.",
      phone: "9876543220",
      address: "Station Area, Badlapur West",
      localityId: badlapurWest.id,
      rating: 4.5,
      isFeatured: true,
    }
  });

  await prisma.business.create({
    data: {
      name: "Katrap plumbing Services",
      category: "plumber",
      description: "Leak detection, water tank cleaning, blockage cleaning, pipe replacement, and bathroom fittings. Fast emergency visits.",
      phone: "9876543221",
      address: "Katrap Bypass Road, Badlapur East",
      localityId: katrap.id,
      rating: 4.6,
      isPromoted: false,
    }
  });

  await prisma.business.create({
    data: {
      name: "Joshi & Associates (CA)",
      category: "ca",
      description: "Taxation services, income tax returns, audit assistance, financial planning, and GST consultation for local small businesses.",
      phone: "9876543222",
      address: "Gandhi Chowk, Badlapur East",
      localityId: badlapurEast.id,
      rating: 4.8,
      isFeatured: false,
    }
  });

  await prisma.business.create({
    data: {
      name: "PixelCraft Photography",
      category: "photographer",
      description: "Professional portfolio shoots, pre-wedding events, birthdays, and product photography. High quality studio services.",
      phone: "9876543223",
      address: "Katrap Lake View road, Badlapur East",
      localityId: katrap.id,
      rating: 4.9,
      isPromoted: true,
      leadsCount: 15,
    }
  });

  await prisma.business.create({
    data: {
      name: "Dynamic Auto & Bike Mechanic",
      category: "mechanic",
      description: "Two-wheeler and four-wheeler repairs, oil change, engine tuning, brake repairs, and breakdown towing assistance.",
      phone: "9876543224",
      address: "Shirgaon bypass road, Badlapur East",
      localityId: shirgaon.id,
      rating: 4.4,
      isFeatured: true,
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
