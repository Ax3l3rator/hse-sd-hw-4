import { NextFunction, Request, Response } from 'express';
import { Order, OrderStatus } from '../entities/Order';
import { Controller } from './Controller';
import RequestDataError from '../utilities/requestDataError';
import RequestDataSucceed from '../utilities/requestDataSucceed';
import { OrderDish } from '../entities/OrderDish';
import axios from 'axios';
import { Dish } from '../entities/Dish';
import { In, MoreThanOrEqual } from 'typeorm';
import { ApiOrderDish } from '../routes';

export class OrderController extends Controller<Order> {
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
    const {
      data: { id },
    } = await axios
      .get('http://auth-api:3000/user', { headers: { Authorization: this.req.headers.authorization } })
      .catch((error) => {
        throw new RequestDataError(error, 500);
      });

    const order = this.repository.create({
      user_id: id,
      special_requests: special_requests || null,
    });

    order.dishes = await this.getOrderDishes(order, dishes);

    try {
      await this.repository.save(order);
    } catch (err) {
      throw new RequestDataError(err.message, 500);
    }

    this.cookOrder(order);

    return new RequestDataSucceed('Created order');
  }

  async parseOrderDishes(dishes: ApiOrderDish[]) {
    const dishQuantities = new Map<number, number>();
    dishes.forEach((dish) => {
      if (dishQuantities.has(dish.id)) {
        dishQuantities.set(dish.id, dishQuantities.get(dish.id) + dish.quantity);
      } else {
        dishQuantities.set(dish.id, dish.quantity);
      }
    });

    return dishQuantities;
  }

  async getOrderDishes(order: Order, dishes: ApiOrderDish[]) {
    const dishRepository = this.getRepository(Dish);
    const orderDishRepository = this.getRepository(OrderDish);
    // ? А почему сразу мап не передать? - Потому что ссылки на подобные структуры передавать не очень безопасно и не очень правильно.
    const dishQuantities = await this.parseOrderDishes(dishes);

    const orderDishes: OrderDish[] = [];
    /* 
    ? Что за конструкция нагроможденная? - Ну, нужен был мап, 
    ? чтобы линейно парсить заказы, теперь у нас есть мап, однако так как мы хотим внутри делать все асинхронно, 
    ? просто пройтись форичем по мапу не получится, ведь у нас тут есть момент с бросанием ошибки. Для этого, мы можем замапить мап(ахах да), 
    ? чтобы вернуть много промисов, и выполнить все, а если кто-то упадет, то ошибка будет передана наверх (Welcome to the jungle!)
    */
    await Promise.all(
      Array.from(dishQuantities).map(async ([id, quantity]) => {
        const dishInDB = await dishRepository.findOne({ where: { id } });

        if (!dishInDB) {
          throw new RequestDataError('ddddd', 500);
        }

        const OrderDish = orderDishRepository.create({
          dish: dishInDB,
          quantity,
          order,
          price: quantity * dishInDB.price,
        });

        orderDishes.push(OrderDish);
      })
    );

    return orderDishes;
  }

  async cookOrder(order: Order) {
    const dishRepository = this.getRepository(Dish);

    await Promise.all(
      order.dishes.map(async (orderDish) => {
        const currentDishState = dishRepository.findOne({
          where: {
            id: orderDish.dish.id,
            is_available: true,
            quantity: MoreThanOrEqual(orderDish.quantity),
          },
        });

        if (!currentDishState) {
          throw 'abort';
        }
      })
    )
      .catch(async (err) => {
        if (err === 'abort') {
          await this.repository.update(order.id, { status: OrderStatus.canceled });
        } else {
          throw new RequestDataError(err, 500);
        }
      })
      .then(async () => {
        await this.repository.update(order.id, { status: OrderStatus.cooking });
        await new Promise(function (resolve, reject) {
          setTimeout(async () => {
            resolve('Cooked');
          }, 5000);
        });
        await this.repository.update(order.id, { status: OrderStatus.completed });
      });
  }
}
