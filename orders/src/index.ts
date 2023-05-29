import { NextFunction, Request, Response } from 'express';
import { source } from './source';
import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import { Routes } from './routes';
import { validationResult } from 'express-validator';
import { port } from './config';

function handleError(err, req: Request, res: Response, next: NextFunction) {
  res.status(err.statusCode || 500).send({ error: err.message });
}

source
  .initialize()
  .then(async () => {
    const app = express();
    app.use(morgan('dev'));
    app.use(bodyParser.json());

    Routes.forEach((route) => {
      app[route.method](route.route, ...route.validation, async (req: Request, res: Response, next: NextFunction) => {
        try {
          const validation_errors = validationResult(req);

          if (!validation_errors.isEmpty()) {
            return res.status(400).json({ validation_error: validation_errors.array()[0] });
          }

          const result = await new route.controller(req, res, next)[route.action]();
          res.status(result.statusCode || 200).json(result.message);
        } catch (err) {
          next(err);
        }
      });
    });

    app.use(handleError);

    app.listen(port);

    console.log(`Server listening on port ${port}`);
  })
  .catch((error) => console.log(error));
