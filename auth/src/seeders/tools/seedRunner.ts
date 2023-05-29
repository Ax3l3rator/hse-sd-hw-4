import { seeders } from '../classMap';

seeders.forEach(async (seeder) => {
  await new seeder().run();
});
