import { IResponse } from '../interfaces/response';

export class ResponseError implements IResponse {
  constructor(data?: any) {
    this.success = false;
    this.data = data;
  }

  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
}

export class ResponseSuccess implements IResponse {
  constructor(data?: any) {
    this.success = true;
    this.data = data;
  }

  data: any[];
  success: boolean;
  error: any;
  errorMessage: string;
}
