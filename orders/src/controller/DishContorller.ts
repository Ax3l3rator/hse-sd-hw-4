import { NextFunction, Request, Response } from 'express';
import { Dish } from '../entities/Dish';
import { source } from '../source';
import RequestDataError from '../utilities/requestDataError';
import RequestDataSucceed from '../utilities/requestDataSucceed';
import { Controller } from './Controller';

export class DishController extends Controller<Dish> {
  constructor(req: Request, res: Response, next: NextFunction) {
    super(Dish, req, res, next);
  }

  async menu() {
    const perPage = 20;
    const page = Number(this.req.params.page);

    if (isNaN(page)) {
      throw new RequestDataError('page somehow is NaN', 418);
    }

    const skip = perPage * (page - 1);

    const [dishes, count] = await this.repository.findAndCount({ take: perPage, skip });

    if (!count) {
      return new RequestDataSucceed('The page is empty', 204);
    }

    return new RequestDataSucceed(dishes, 200);
  }

  async add() {
    const { name, description, price, quantity } = this.req.body;

    const dish = this.repository.create({ name, description, price, quantity, is_available: quantity > 0 });

    await this.repository.save(dish);

    return new RequestDataSucceed('Done');
  }

  async remove() {
    const { id } = this.req.body;
    await this.repository.delete(id).catch((err) => {
      throw new RequestDataError('there is no dish with this id ', 400);
    });
  }

  async edit() {
    const dishId = Number(this.req.params.dish_id);
    const changes = this.req.body;
    await this.repository.update(dishId, changes);

    return new RequestDataSucceed('Done');
  }

  async get() {
    const dishId = Number(this.req.params.dish_id);

    if (isNaN(dishId)) {
      throw new RequestDataError('dish id somehow is NaN', 418);
    }

    const dish = await this.repository.findOne({
      where: {
        id: dishId,
      },
    });

    if (!dish) {
      throw new RequestDataError('No dish with this id');
    }

    return new RequestDataSucceed(dish);
  }
}
