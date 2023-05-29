import { Role } from '../../entities/Role';
import { source } from '../../dbsource';
import Seed from '../tools/seed';

export default class RoleSeeder implements Seed {
  async run() {
    source.initialize().then(async () => {
      const rolesRepo = source.getRepository(Role);
      const selected = await rolesRepo.find();
      if (selected.length == 0) {
        await source
          .createQueryBuilder()
          .insert()
          .into('roles')
          .values([
            { name: 'admin', permission_level: 0, pass_code: 'pass_code' },
            { name: 'manager', permission_level: 1, pass_code: 'pass_code' },
            { name: 'guest', permission_level: 2 },
          ])
          .execute()
          .then((val) => console.log(val));
      } else {
        return;
      }
    });
  }
}
