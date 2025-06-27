import { Injectable } from '@nestjs/common';

export interface ApiResponse<T = any> {
    status: string;
    message: string;
    data?: T;
    error?: string;
    code: number;
}

@Injectable()
export class ResponseHandler {
    static success<T>(
        data: T, 
        message: string, 
        status: string,
        code: number
    ): ApiResponse<T> {
        return {
            status,
            message,
            data,
            code,
        };
    }

    static error(
        error: string, 
        message: string , 
        status: string ,
        code : number
    ): ApiResponse<never> {
        return {
            status,
            message,
            error,
            code,
        };
    }
}
export interface CloudinaryResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}