require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

async function seedDatabase() {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' Connected to MongoDB for seeding');


    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log(' Cleared existing data');

    // Create sample tenants and admins
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const users = [
      // LogisticsCo users
      {
        email: 'admin@logisticsco.com',
        password: hashedPassword,
        customerId: 'logisticsco',
        role: 'Admin',
        firstName: 'Dheeraj',
        lastName: 'Kumar'
      },
      {
        email: 'user@logisticsco.com',
        password: hashedPassword,
        customerId: 'logisticsco',
        role: 'User',
        firstName: 'Nitin',
        lastName: 'deshmukh'
      },
      // RetailGmbH users
      {
        email: 'admin@retailgmbh.com',
        password: hashedPassword,
        customerId: 'retailgmbh',
        role: 'Admin',
        firstName: 'Tara',
        lastName: 'Kadam'
      },
      {
        email: 'user@retailgmbh.com',
        password: hashedPassword,
        customerId: 'retailgmbh',
        role: 'User',
        firstName: 'Sarish',
        lastName: 'Sonawane'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Created users:', createdUsers.map(u => ({ email: u.email, role: u.role, tenant: u.customerId })));

    // Create sample tickets for each tenant
    const tickets = [
      // LogisticsCo tickets
      {
        title: 'Shipment Tracking Issue',
        description: 'Customer cannot track their shipment with tracking number LG12345',
        status: 'Open',
        priority: 'High',
        customerId: 'logisticsco',
        createdBy: createdUsers.find(u => u.email === 'user@logisticsco.com')._id
      },
      {
        title: 'Delivery Delay Complaint',
        description: 'Package was supposed to arrive yesterday but still not delivered',
        status: 'In Progress',
        priority: 'Medium',
        customerId: 'logisticsco',
        createdBy: createdUsers.find(u => u.email === 'admin@logisticsco.com')._id
      },
      // RetailGmbH tickets
      {
        title: 'Product Return Request',
        description: 'Customer wants to return defective electronics item',
        status: 'Open',
        priority: 'Medium',
        customerId: 'retailgmbh',
        createdBy: createdUsers.find(u => u.email === 'user@retailgmbh.com')._id
      },
      {
        title: 'Website Login Problems',
        description: 'Multiple customers reporting they cannot log into the online store',
        status: 'Open',
        priority: 'Critical',
        customerId: 'retailgmbh',
        createdBy: createdUsers.find(u => u.email === 'admin@retailgmbh.com')._id
      }
    ];

    const createdTickets = await Ticket.insertMany(tickets);
    console.log('🎫 Created tickets:', createdTickets.map(t => ({ title: t.title, tenant: t.customerId, status: t.status })));

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('LogisticsCo Admin: admin@logisticsco.com / password123');
    console.log('LogisticsCo User:  user@logisticsco.com / password123');
    console.log('RetailGmbH Admin:  admin@retailgmbh.com / password123');
    console.log('RetailGmbH User:   user@retailgmbh.com / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
}


seedDatabase();
