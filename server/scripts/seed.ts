import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import { FeatureRequest } from '../src/models/FeatureRequest';
import { Vote } from '../src/models/Vote';
import { Comment } from '../src/models/Comment';
import { env } from '../src/config/env';
import { connectDB } from '../src/config/db';

/**
 * Seed function — populates demo data.
 * @param skipConnect - If true, assumes mongoose is already connected. If false (default), calls connectDB().
 */
export const seed = async (skipConnect = false) => {
  if (!skipConnect) {
    await connectDB();
  }

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    FeatureRequest.deleteMany({}),
    Vote.deleteMany({}),
    Comment.deleteMany({})
  ]);

  const adminPassword = await bcrypt.hash('Admin@123!', env.BCRYPT_ROUNDS);
  const userPassword = await bcrypt.hash('User@123!', env.BCRYPT_ROUNDS);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: adminPassword,
    role: 'ADMIN',
    emailVerified: true
  });

  const user = await User.create({
    name: 'Demo User',
    email: 'user@example.com',
    passwordHash: userPassword,
    emailVerified: true
  });

  console.log('Creating feature requests...');
  const features = await FeatureRequest.insertMany([
    { title: 'Dark Mode', description: 'Please add a dark theme option to the application.', category: 'UI_UX', status: 'UNDER_REVIEW', author: user._id },
    { title: 'Mobile App', description: 'Create a companion mobile app for iOS and Android.', category: 'GENERAL', status: 'UNDER_REVIEW', author: user._id },
    { title: 'Slack Integration', description: 'Send notifications directly to a Slack channel when new requests are created.', category: 'INTEGRATIONS', status: 'PLANNED', author: user._id },
    { title: 'Jira Sync', description: 'Two-way sync with Jira issues so you can track development alongside requests.', category: 'INTEGRATIONS', status: 'PLANNED', author: user._id },
    { title: 'Faster Dashboard', description: 'The dashboard takes too long to load when there are many feature requests and votes.', category: 'PERFORMANCE', status: 'IN_PROGRESS', author: user._id },
    { title: 'Real-time Updates', description: 'Update the UI automatically when new votes or comments are added without page refresh.', category: 'UI_UX', status: 'IN_PROGRESS', author: user._id },
    { title: 'SSO Support', description: 'Add SAML/SSO login options for enterprise customers.', category: 'GENERAL', status: 'COMPLETED', author: user._id },
    { title: 'Export to CSV', description: 'Allow admins to export feature request reports and vote data to CSV format.', category: 'GENERAL', status: 'COMPLETED', author: user._id }
  ]);

  console.log('Adding votes...');
  await Vote.insertMany([
    { user: user._id, featureRequest: features[0]._id },
    { user: admin._id, featureRequest: features[0]._id },
    { user: user._id, featureRequest: features[2]._id }
  ]);

  await FeatureRequest.findByIdAndUpdate(features[0]._id, { voteCount: 2 });
  await FeatureRequest.findByIdAndUpdate(features[2]._id, { voteCount: 1 });

  console.log('Adding comments...');
  const c1 = await Comment.create({ featureRequest: features[0]._id, author: user._id, content: 'I really need this feature!' });
  await Comment.create({ featureRequest: features[0]._id, author: admin._id, content: 'Thanks for the feedback! We are looking into it.', parentComment: c1._id });

  await FeatureRequest.findByIdAndUpdate(features[0]._id, { commentCount: 2 });

  console.log('✅ Seed completed successfully!');
};

// Run directly when invoked as a standalone script: `npm run seed` or `npx ts-node scripts/seed.ts`
if (require.main === module) {
  seed(false)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
