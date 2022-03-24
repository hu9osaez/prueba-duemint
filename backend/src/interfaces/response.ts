// success: true => message, data
// success: false => errorMessage, error

export interface IResponse {
  success: boolean;
  errorMessage: string;
  data: any[];
  error: any;
}
