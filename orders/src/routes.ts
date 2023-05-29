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

export const Routes: Route[] = [
  {
    method: 'get',
    route: '/menu/:page',
    controller: DishController,
    action: 'getDishes',
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
];
