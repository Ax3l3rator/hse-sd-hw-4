import { body, header, param } from 'express-validator';
import { UserController } from './controller/UserController';
import * as jwt from 'jsonwebtoken';
import { secret } from './config';

export const Routes = [
  {
    method: 'get',
    route: '/user',
    controller: UserController,
    action: 'user',
    validation: [
      header('authorization')
        .exists()
        .withMessage('No authorization header provided')
        .isString()
        .withMessage('Authorization must be string')
        .customSanitizer((value) => value.split(' ')[1])
        .notEmpty()
        .withMessage('no token provided')
        .custom((value: string) => {
          try {
            jwt.verify(value, secret);
            return true;
          } catch (err) {
            return Promise.reject(err.message);
          }
        }),
    ],
  },
  {
    method: 'post',
    route: '/auth/register',
    controller: UserController,
    action: 'register',
    validation: [
      body('username')
        .exists()
        .withMessage('must be provided')
        .trim()
        .notEmpty()
        .withMessage('must not be empty')
        .isString()
        .withMessage('must be string')
        .isLength({ min: 5, max: 25 })
        .withMessage('must be from 5 to 25 characters long')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]*$/)
        .withMessage('username must start with letter')
        .matches(/^[a-zA-Z0-9._-]*$/)
        .withMessage('must only contain small or capital latin letters, numbers, or following symbols: ".", "_", "-"'),
      body('email')
        .exists()
        .withMessage('must be provided')
        .trim()
        .notEmpty()
        .withMessage('must not be empty')
        .isEmail()
        .withMessage('must be a valid email (email@example.com)'),
      body('password')
        .exists()
        .withMessage('must be provided')
        .trim()
        .notEmpty()
        .withMessage('must not be empty')
        .isLength({ min: 5, max: 64 })
        .withMessage('must be from 5 to 64 characters long')
        .isStrongPassword()
        .withMessage('is a weak password'),
      body('role')
        .if(body('pass_code').exists())
        .trim()
        .notEmpty()
        .withMessage('must be string')
        .isString()
        .withMessage('must be provided to use a pass_code')
        .isLength({ min: 5, max: 32 })
        .withMessage('must be from 5 to 32 characters long'),
      body('pass_code')
        .if(body('role').exists())
        .notEmpty()
        .withMessage('must be provided to get a role')
        .isString()
        .withMessage('must be string')
        .isLength({ min: 5, max: 64 })
        .withMessage('must be from 5 to 64 characters long'),
    ],
  },
  {
    method: 'post',
    route: '/auth/login',
    controller: UserController,
    action: 'login',
    validation: [
      body('email')
        .exists()
        .withMessage('must be provided')
        .trim()
        .notEmpty()
        .withMessage('must not be empty')
        .isEmail()
        .withMessage('must be a valid email (email@example.com)'),
      body('password')
        .exists()
        .withMessage('must be provided')
        .trim()
        .notEmpty()
        .withMessage('must not be empty')
        .isLength({ min: 5, max: 64 })
        .withMessage('must be from 5 to 64 characters long')
        .matches(/^(\w*[$@$!%*?&_.-]*)*$/)
        .withMessage(
          'must only contain small or capital latin letters, numbers, or special symbols($@!%*?&_) and they should be used at least once'
        ),
    ],
  },
];
