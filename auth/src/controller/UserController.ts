import { source } from '../dbsource';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import RequestDataError from '../utilities/requestDataError';
import * as bcrypt from 'bcrypt';
import RequestDataSucceed from '../utilities/requestDataSucceed';
import * as jwt from 'jsonwebtoken';
import { secret } from '../config';
import { Session } from '../entities/Session';
import moment from 'moment';
import authJwtPayload from '../utilities/authJwtPayload';

export class UserController {
  private userRepository = source.getRepository(User);

  private generateAccessToken(user: User, role: Role) {
    const payload = {
      id: user.id,
      permission_level: role.permission_level,
    };
    return jwt.sign(payload, secret, { expiresIn: '15m' });
  }

  async login(request: Request, response: Response, next: NextFunction) {
    const { email, password } = request.body;
    const user = await this.userRepository.findOne({ where: { email: email }, relations: { role: true } });

    if (!user) {
      throw new RequestDataError(`User with email ${email} does not exist`);
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      throw new RequestDataError(`Wrong password`, 403);
    }

    const sessionRepository = source.getRepository(Session);

    const access_token = this.generateAccessToken(user, user.role);

    const session = sessionRepository.create({
      session_token: access_token,
      user: user,
      expires_at: moment().add(15, 'minute').toDate(),
    });

    sessionRepository.upsert(session, {
      conflictPaths: ['user'],
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
    response.header('access_token', access_token);

    return new RequestDataSucceed('Successfully logged in', 200);
  }

  async register(request: Request, response: Response, next: NextFunction) {
    const { username, email, password } = request.body;
    let { role, pass_code } = request.body;

    const found = await this.userRepository.findOne({ where: [{ username: username }, { email: email }] });
    if (found) {
      throw new RequestDataError('User with this username or email already exists', 403);
    }

    if (!role) {
      role = 'guest';
      pass_code = null;
    }

    const rolesRepository = source.getRepository(Role);

    const assignRole = await rolesRepository.findOne({ where: { name: role } });

    if (!assignRole) {
      throw new RequestDataError(`Role "${role}" does not exist`, 400);
    }

    if (assignRole.pass_code !== pass_code) {
      throw new RequestDataError(`Pass code for role "${role}" is wrong!`, 403);
    }

    const password_hash = bcrypt.hashSync(password, 5);

    const user = this.userRepository.create({
      username: username,
      email: email,
      password_hash: password_hash,
      role: assignRole,
    });

    this.userRepository.save(user);

    return new RequestDataSucceed(
      `User ${username} with email ${email} and role ${role} was created successfully`,
      201
    );
  }

  async user(request: Request, response: Response, next: NextFunction) {
    const access_token = request.headers.authorization!;

    if (!access_token) {
      throw new RequestDataError('Something went wrong. No idea why', 418);
    }

    const { id, permission_level } = jwt.verify(access_token, secret) as authJwtPayload;

    const returnable = { id: id, permission_level: permission_level };

    return new RequestDataSucceed(returnable, 200);
  }
}
