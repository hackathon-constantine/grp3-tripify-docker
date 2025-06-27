import { LoggerService } from "@domain/services/logger.service";
import { GuidiniApi } from "@infrastructure/guidini";
import { ResponseHandler } from '@application/interfaces/response';
import { Body, Controller, Post } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import { Public } from "@application/decorators/isPublic.decorator";

@Controller('payment')
export class PaymentController {
    private Log: LoggerService = new LoggerService('PaymentController');

    @Public()
    @Post('checkout')
    async createPayment(@Body('amount') amount: number) {
        this.Log.logger('Creating payment', { module: 'PaymentController', method: 'createPayment' });
        try {
            const payment = await GuidiniApi.createPayment(amount);
            return ResponseHandler.success(payment, 'Payment created successfully', 'success', HttpStatus.CREATED);
        } catch (error) {
            this.Log.error('Error creating payment', error, { module: 'PaymentController', method: 'createPayment' });
            return ResponseHandler.error('Error creating payment', error.message || 'Unknown error', 'error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('verify')
    async verifyPayment() {
        this.Log.logger('Verifying payment', { module: 'PaymentController', method: 'verifyPayment' });
        try {
            const payment = await GuidiniApi.verifyPayment();
            return ResponseHandler.success(payment, 'Payment verified successfully', 'success', HttpStatus.OK);
        } catch (error) {
            this.Log.error('Error verifying payment', error, { module: 'PaymentController', method: 'verifyPayment' });
            return ResponseHandler.error('Error verifying payment', error.message || 'Unknown error', 'error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
