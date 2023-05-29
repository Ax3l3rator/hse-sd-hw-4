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

  async getDishes() {
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

  async editDishes() {}
}
