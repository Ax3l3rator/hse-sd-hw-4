export default class RequestDataSucceed {
  statusCode: number;
  message: Object | string;

  constructor(message: Object | string, statusCode?: number) {
    this.message = message;
    this.statusCode = statusCode || 200;
  }
}
