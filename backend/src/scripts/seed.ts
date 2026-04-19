import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { validateEnv, env } from '../config/env';

// ── Import models ─────────────────────────────────────────────────────────────
import User      from '../models/User';
import Provider  from '../models/Provider';
import Category  from '../models/Category';
import Service   from '../models/Service';

validateEnv();

// ── Category seed data ────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Plumbing',         slug: 'plumbing',         icon: 'Wrench',    color: '#3B82F6', order: 1,  serviceCount: 0, description: 'Pipe repairs, leakage fixing, tap installation and all plumbing needs.' },
  { name: 'Electrical',       slug: 'electrical',       icon: 'Zap',       color: '#F59E0B', order: 2,  serviceCount: 0, description: 'Wiring, switchboard repair, fan installation, and all electrical work.' },
  { name: 'Cleaning',         slug: 'cleaning',         icon: 'Sparkles',  color: '#10B981', order: 3,  serviceCount: 0, description: 'Home, office, and deep cleaning services by trained professionals.' },
  { name: 'Tutoring',         slug: 'tutoring',         icon: 'BookOpen',  color: '#8B5CF6', order: 4,  serviceCount: 0, description: 'Academic tutoring for all grades, competitive exams, and skill courses.' },
  { name: 'Fitness',          slug: 'fitness',          icon: 'Dumbbell',  color: '#EF4444', order: 5,  serviceCount: 0, description: 'Personal trainers, yoga instructors, and nutrition counsellors.' },
  { name: 'Beauty',           slug: 'beauty',           icon: 'Scissors',  color: '#EC4899', order: 6,  serviceCount: 0, description: 'Hair, skincare, makeup, and beauty services at your doorstep.' },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Monitor',   color: '#06B6D4', order: 7,  serviceCount: 0, description: 'AC, washing machine, refrigerator, and all home appliance repairs.' },
  { name: 'Moving',           slug: 'moving',           icon: 'Truck',     color: '#D4AF37', order: 8,  serviceCount: 0, description: 'Packers and movers for home, office, and vehicle relocation.' },
  { name: 'Carpentry',        slug: 'carpentry',         icon: 'Hammer',   color: '#92400E', order: 9,  serviceCount: 0, description: 'Furniture repair, custom woodwork, and door/window installation.' },
  { name: 'Painting',         slug: 'painting',          icon: 'Paintbrush',color: '#7C3AED',order: 10, serviceCount: 0, description: 'Interior and exterior painting, waterproofing, and wall textures.' },
];

// ── Admin user seed ───────────────────────────────────────────────────────────
const ADMIN_USER = {
  name:       'Admin User',
  email:      'admin@marketplace.com',
  password:   'Admin@123456',
  role:       'admin' as const,
  phone:      '9999999999',
  isVerified: true,
  isActive:   true,
};

// ── Sample provider seed ──────────────────────────────────────────────────────
const SAMPLE_PROVIDERS = [
  {
    user: { name: 'Ramesh Kumar',  email: 'ramesh@test.com',  phone: '9876543210', password: 'Test@12345' },
    provider: {
      businessName: 'Ramesh Plumbing Services',
      description:  'Expert plumber with 10+ years of experience in Mumbai. Available for emergency calls 24/7. Specializes in pipe leakage, tap installation, and bathroom fitting.',
      categorySlug: 'plumbing',
      pricing:      { min: 299, max: 1999, currency: 'INR', unit: 'job' as const },
      location:     { lat: 19.076, lng: 72.877, address: 'Andheri West, Mumbai', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400058', serviceRadius: 15 },
      languages:        ['Hindi', 'Marathi', 'English'],
      responseTime:     'Within 1 hour',
      isEmergencyAvailable: true,
      yearsOfExperience: 10,
      rating:       { average: 4.8, count: 142 },
      completedJobs: 342,
      tags:         ['emergency', 'experienced', 'affordable'],
    },
    service: {
      title:       'Pipe Leakage & Repair',
      description: 'Quick and reliable pipe leakage fixing for all types of pipes. We use high-quality materials and provide a 30-day warranty on all repairs.',
      pricing:     { amount: 499, currency: 'INR', unit: 'job' as const, isNegotiable: false },
      duration:    60,
      tags:        ['plumbing', 'pipe', 'leakage', 'emergency'],
      isEmergencyAvailable: true,
      isFeatured:  true,
    },
  },
  {
    user: { name: 'Suresh Electricals', email: 'suresh@test.com', phone: '9876543211', password: 'Test@12345' },
    provider: {
      businessName: 'Suresh Electrical Works',
      description:  'Certified electrician serving Bangalore for 8 years. Expertise in household wiring, switchboard repair, fan and AC installation.',
      categorySlug: 'electrical',
      pricing:      { min: 199, max: 2999, currency: 'INR', unit: 'job' as const },
      location:     { lat: 12.971, lng: 77.594, address: 'Koramangala, Bangalore', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560034', serviceRadius: 20 },
      languages:        ['Kannada', 'Hindi', 'English'],
      responseTime:     'Within 2 hours',
      isEmergencyAvailable: true,
      yearsOfExperience: 8,
      rating:       { average: 4.7, count: 98 },
      completedJobs: 215,
      tags:         ['certified', 'wiring', 'installation'],
    },
    service: {
      title:       'Switchboard & Wiring Repair',
      description: 'Complete electrical inspection and repair service. We fix switchboards, replace faulty wiring, and install new sockets and switches safely.',
      pricing:     { amount: 399, currency: 'INR', unit: 'job' as const, isNegotiable: true },
      duration:    90,
      tags:        ['electrical', 'wiring', 'repair'],
      isEmergencyAvailable: true,
      isFeatured:  true,
    },
  },
  {
    user: { name: 'Priya Cleaning',  email: 'priya@test.com',  phone: '9876543212', password: 'Test@12345' },
    provider: {
      businessName: 'Priya Home Cleaning',
      description:  'Professional cleaning team providing deep cleaning, bathroom cleaning, and office cleaning services in Delhi NCR.',
      categorySlug: 'cleaning',
      pricing:      { min: 799, max: 4999, currency: 'INR', unit: 'job' as const },
      location:     { lat: 28.679, lng: 77.213, address: 'Lajpat Nagar, New Delhi', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110024', serviceRadius: 25 },
      languages:        ['Hindi', 'English'],
      responseTime:     'Same day',
      isEmergencyAvailable: false,
      yearsOfExperience: 5,
      rating:       { average: 4.9, count: 201 },
      completedJobs: 511,
      tags:         ['deep-clean', 'professional', 'team'],
    },
    service: {
      title:       'Deep Home Cleaning (2BHK)',
      description: 'Comprehensive deep cleaning service covering all rooms, kitchen, bathrooms, and balconies. Eco-friendly products used. 3-4 hours service.',
      pricing:     { amount: 1499, currency: 'INR', unit: 'job' as const, isNegotiable: false },
      duration:    240,
      tags:        ['cleaning', 'deep-clean', '2bhk'],
      isEmergencyAvailable: false,
      isFeatured:  true,
    },
  },
];

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('\n🌱 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected\n');

    // ── Categories ──
    console.log('📂 Seeding categories...');
    let createdCount = 0;
    for (const cat of CATEGORIES) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        createdCount++;
        console.log(`   ✓ ${cat.name}`);
      } else {
        console.log(`   ↩ ${cat.name} already exists`);
      }
    }
    console.log(`   → ${createdCount} categories created\n`);

    // ── Admin user ──
    console.log('👑 Seeding admin user...');
    const adminExists = await User.findOne({ email: ADMIN_USER.email });
    if (!adminExists) {
      await User.create(ADMIN_USER);
      console.log(`   ✓ Admin created: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
    } else {
      console.log(`   ↩ Admin already exists`);
    }
    console.log();

    // ── Sample providers ──
    console.log('👷 Seeding sample providers...');
    for (const sample of SAMPLE_PROVIDERS) {
      const userExists = await User.findOne({ email: sample.user.email });
      if (userExists) {
        console.log(`   ↩ ${sample.user.name} already exists`);
        continue;
      }

      // Create user
      const newUser = await User.create({ ...sample.user, role: 'provider', isVerified: true });

      // Find category
      const category = await Category.findOne({ slug: sample.provider.categorySlug });
      if (!category) { console.log(`   ⚠ Category not found: ${sample.provider.categorySlug}`); continue; }

      // Create provider
      const { categorySlug: _slug, ...provData } = sample.provider;
      const newProvider = await Provider.create({
        ...provData,
        userId:     newUser._id,
        category:   category._id,
        isApproved: true,
        isVerified: true,
        isOnline:   true,
        availability: {
          days:      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          timeSlots: [{ start: '08:00', end: '20:00' }],
          isAvailableNow: true,
        },
        profileCompletionScore: 85,
      });

      // Create service
      const newService = await Service.create({
        ...sample.service,
        provider: newProvider._id,
        category: category._id,
        isActive: true,
      });

      // Link service to provider
      await Provider.findByIdAndUpdate(newProvider._id, { $push: { services: newService._id } });

      // Update category service count
      await Category.findByIdAndUpdate(category._id, { $inc: { serviceCount: 1 } });

      console.log(`   ✓ ${sample.user.name} → ${sample.provider.businessName}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅  Seeding complete!');
    console.log('\n📋 Default accounts:');
    console.log(`   Admin:    ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
    for (const s of SAMPLE_PROVIDERS) {
      console.log(`   Provider: ${s.user.email} / ${s.user.password}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
}

seed();
