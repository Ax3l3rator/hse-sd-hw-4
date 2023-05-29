import express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { source } from './dbsource';
import { Routes } from './routes';
import { port } from './config';
import morgan from 'morgan';
import { FieldValidationError, validationResult } from 'express-validator';

function handleError(err, req: Request, res: Response, next) {
  res.status(err.statusCode || 500).send({ error: err.message });
}

source
  .initialize()
  .then(async () => {
    const app = express();
    app.use(morgan('dev'));
    app.use(bodyParser.json());

    Routes.forEach((route) => {
      app[route.method](route.route, ...route.validation, async (req: Request, res: Response, next: Function) => {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({
              validation_errors: errors.array().map((err) => {
                if (err.type === 'field') {
                  err as FieldValidationError;
                  return `${err.type} ${err.path} ${err.msg}`;
                } else {
                  return err;
                }
              }),
            });
          }
          const result = await new (route.controller as any)()[route.action](req, res, next);
          res.status(result.statusCode || 200).json(result.message);
        } catch (error) {
          next(error);
        }
      });
    });
    app.use(handleError);

    app.listen(port);

    console.log(`Server started at port ${port}`);
  })
  .catch((error) => console.log(error));
