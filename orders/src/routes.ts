import { ValidationChain, body, header, param } from 'express-validator';
import { DishController } from './controller/DishContorller';
import { OrderController } from './controller/OrderController';

export interface Route {
  method: string;
  route: string;
  controller: any;
  action: string;
  validation: ValidationChain[];
}

export interface ApiOrderDish {
  id: number;
  quantity: number;
}

export const Routes: Route[] = [
  {
    method: 'get',
    route: '/menu/:page',
    controller: DishController,
    action: 'menu',
    validation: [param('page').isInt({ min: 1, max: 2000000000 }).withMessage('Page must be number').toInt()],
  },
  {
    method: 'get',
    route: '/order/:id',
    controller: OrderController,
    action: 'getOrder',
    validation: [param('id').isInt({ min: 1 }).withMessage('id must be number').toInt()],
  },
  {
    method: 'post',
    route: '/order/',
    controller: OrderController,
    action: 'createOrder',
    validation: [
      header('authorization')
        .exists()
        .withMessage('No authorization header provided')
        .isString()
        .withMessage('Authorization must be string')
        .notEmpty()
        .withMessage('no token provided'),
      body('special_requests').trim().isString().withMessage('must be string'),
      body('dishes').isArray(),
      body('dishes.*').isObject().exists().notEmpty(),
      body('dishes.*.id').exists().notEmpty().toInt().isInt(),
      body('dishes.*.quantity').exists().notEmpty().toInt().isInt(),
    ],
  },
  {
    method: 'get',
    route: '/dish/:id',
    controller: DishController,
    action: 'get',
    validation: [param('id').exists().isInt({ min: 1 }).toInt()],
  },
  {
    method: 'post',
    route: '/dish/',
    controller: DishController,
    action: 'add',
    validation: [
      header('authorization')
        .exists()
        .withMessage('No authorization header provided')
        .isString()
        .withMessage('Authorization must be string')
        .notEmpty()
        .withMessage('no token provided'),
      body('name').exists().isString().trim().notEmpty(),
      body('description').exists().isString().trim().notEmpty(),
      body('price').exists().isFloat({ min: 0.01 }).toFloat(),
      body('quantity').exists().isInt({ min: 0 }).toInt(),
    ],
  },
  {
    method: 'delete',
    route: '/dish/:id',
    controller: DishController,
    action: 'remove',
    validation: [
      param('id').exists().isInt({ min: 1 }).toInt(),
      header('authorization')
        .exists()
        .withMessage('No authorization header provided')
        .isString()
        .withMessage('Authorization must be string')
        .notEmpty()
        .withMessage('no token provided'),
    ],
  },
  {
    method: 'put',
    route: '/dish/:id',
    controller: DishController,
    action: 'edit',
    validation: [
      param('id').exists().isInt({ min: 1 }).toInt(),
      header('authorization')
        .exists()
        .withMessage('No authorization header provided')
        .isString()
        .withMessage('Authorization must be string')
        .notEmpty()
        .withMessage('no token provided'),
      body('name').isString().trim().notEmpty(),
      body('description').isString().trim().notEmpty(),
      body('price').isFloat({ min: 0.01 }).toFloat(),
      body('quantity').isInt({ min: 0 }).toInt(),
    ],
  },
];
