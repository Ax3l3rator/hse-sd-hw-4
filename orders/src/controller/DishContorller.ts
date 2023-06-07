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

  async add(req: Request, res: Response, next: NextFunction) {
    const dishParams = req.body;

    const dish = this.repository.create(dishParams);

    await this.repository.save(dish);

    return new RequestDataSucceed('Done');
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;
    this.repository.delete(id);
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    const dishId = Number(this.req.params.dish_id);
    const changes = req.body;
    await this.repository.update(dishId, changes);

    return new RequestDataSucceed('Done');
  }

  async get(req: Request, res: Response, next: NextFunction) {
    const dishId = Number(this.req.params.dish_id);

    if (isNaN(dishId)) {
      throw new RequestDataError('dish id somehow is NaN', 418);
    }

    const dish = await this.repository.findOne({
      where: {
        id: dishId,
      },
    });

    return new RequestDataSucceed(dish);
  }
}
