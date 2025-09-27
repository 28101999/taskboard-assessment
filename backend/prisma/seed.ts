import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create demo user with bcrypt hash
  const passwordHash = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@local.com' },
    update: {},
    create: {
      email: 'demo@local.com',
      passwordHash,
    },
  });

  // Clear todos for demo user
  await prisma.todo.deleteMany({
    where: { ownerId: demoUser.id },
  });

  // Create sample todos
  const todos = [
    { title: 'Complete project documentation', description: 'Write comprehensive README and API documentation', completed: false },
    { title: 'Review code changes', description: 'Go through all recent pull requests and provide feedback', completed: true },
    { title: 'Update dependencies', description: 'Check for security vulnerabilities and update packages', completed: false },
    { title: 'Plan next sprint', description: 'Define user stories and estimate tasks for upcoming sprint', completed: true },
    { title: 'Test edge cases', description: 'Verify optimistic locking and bulk operations work correctly', completed: false },
  ];

  for (const todo of todos) {
    await prisma.todo.create({
      data: { ...todo, ownerId: demoUser.id },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Demo user: demo@local.com / demo123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
