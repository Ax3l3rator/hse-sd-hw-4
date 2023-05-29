import * as jwt from 'jsonwebtoken';

export default interface authJwtPayload extends jwt.JwtPayload {
  id: number;
  permission_level: number;
}
