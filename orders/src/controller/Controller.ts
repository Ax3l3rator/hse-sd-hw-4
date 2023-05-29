import { NextFunction, Request, Response } from 'express';
import { BaseEntity, Entity, EntitySchema, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { source } from '../source';

export abstract class Controller<Entity extends ObjectLiteral> {
  protected repository: Repository<Entity>;
  protected req: Request;
  protected res: Response;
  protected next: NextFunction;

  constructor(entity: EntityTarget<Entity>, req: Request, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.repository = source.getRepository(entity);
  }

  protected getRepository<T>(entity: EntityTarget<T>) {
    return source.getRepository(entity);
  }
}
