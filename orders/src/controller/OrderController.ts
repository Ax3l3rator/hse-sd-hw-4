import { NextFunction, Request, Response } from 'express';
import { Order, OrderStatus } from '../entities/Order';
import { Controller } from './Controller';
import RequestDataError from '../utilities/requestDataError';
import RequestDataSucceed from '../utilities/requestDataSucceed';
import { OrderDish } from '../entities/OrderDish';
import axios from 'axios';
import { Dish } from '../entities/Dish';
import { In, MoreThanOrEqual } from 'typeorm';
import { rawListeners } from 'process';
import { compareSync } from 'bcrypt';

export class OrderController extends Controller<Order> {
  private static cooking = false;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(Order, req, res, next);
  }

  async getOrder() {
    const id = Number(this.req.params.id);

    if (isNaN(id)) {
      throw new RequestDataError('id somehow is NaN', 418);
    }

    const order = await this.repository.findOne({ where: { id: id } });
    if (!order) {
      throw new RequestDataError('No order with  such id', 400);
    }
    const orderDishRepository = this.getRepository(OrderDish);
    console.log(order);
    const orderDishes: OrderDish[] = await orderDishRepository.find({
      relations: {
        dish: true,
      },
      where: {
        order: { id: order.id },
      },
    });
    const all_dishes = orderDishes.map((orderDish) => {
      return {
        id: orderDish.dish.id,
        name: orderDish.dish.name,
        quantity: orderDish.quantity,
        price: Number(orderDish.price),
        description: orderDish.dish.description,
      };
    });
    const final = {
      id: order.id,
      status: order.status,
      special_requests: order.special_requests,
      user: order.user_id,
      dishes: all_dishes,
    };
    return new RequestDataSucceed(final, 200);
  }

  async createOrder() {
    const { dishes, special_requests } = this.req.body;
    const dishMap = new Map<number, number>(
      dishes.map((dish) => {
        return [dish.id, dish.quantity];
      })
    );
    const {
      data: { id, permission_level },
    } = await axios
      .get('http://auth-api:3000/user', { headers: { Authorization: this.req.headers.authorization } })
      .catch((error) => {
        throw new RequestDataError('Bad call to auth', 500);
      });

    const dishRepository = this.getRepository(Dish);

    const orderDishes = await dishRepository.find({
      where: { id: In(dishes.map((dish) => dish.id)), is_available: true },
    });

    orderDishes.filter(async (dish) => {
      if (dish.quantity > dishMap.get(dish.id)) {
        await dishRepository.update(dish.id, { quantity: dish.quantity - dishMap.get(dish.id) });
        return true;
      }

      if (dish.quantity == dishMap.get(dish.id)) {
        await dishRepository.update(dish.id, { quantity: 0, is_available: false });
        return true;
      }
      return false;
    });

    if (!orderDishes || orderDishes.length == 0) {
      throw new RequestDataError('Nothing from the list is available', 400);
    }
    const order = this.repository.create({
      user_id: id,
      dishes: orderDishes,
      special_requests: special_requests || null,
    });

    try {
      await this.repository.save(order);
    } catch (err) {
      throw new RequestDataError(err.message, 500);
    }

    this.cookOrder(order);

    return new RequestDataSucceed('Created order');
  }

  async cookOrder(order: Order) {
    await this.repository.update(order.id, { status: OrderStatus.cooking });
    await new Promise(function (resolve, reject) {
      setTimeout(async () => {
        resolve('Cooked');
      }, 5000);
    });
    await this.repository.update(order.id, { status: OrderStatus.completed });
  }
}
