import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@casa-segura/database';

export interface CreatePaymentParams {
  amount: number; // centavos
  method: PaymentMethod;
  description: string;
  payer_email: string;
  installments?: number;
  job_code: string;
}

export interface PaymentGatewayResponse {
  payment_id: string;
  status: string;
  qr_code?: string;
  qr_code_base64?: string;
  expires_at?: Date;
  external_url?: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly useMock: boolean;
  private readonly mercadoPagoAccessToken?: string;

  constructor(private config: ConfigService) {
    this.useMock = this.config.get('NODE_ENV') !== 'production';
    this.mercadoPagoAccessToken = this.config.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!this.useMock && !this.mercadoPagoAccessToken) {
      this.logger.warn('Mercado Pago access token not configured, using mock provider');
      (this as any).useMock = true;
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    if (this.useMock) {
      return this.createMockPayment(params);
    }
    return this.createMercadoPagoPayment(params);
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    if (this.useMock) {
      return 'approved';
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.mercadoPagoAccessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get payment status: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<{ refund_id: string }> {
    if (this.useMock) {
      return { refund_id: `mock_refund_${Date.now()}` };
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.mercadoPagoAccessToken}`,
          },
          body: JSON.stringify(amount ? { amount: amount / 100 } : {}),
        }
      );

      const data = await response.json();
      return { refund_id: data.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to refund payment: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  private async createMockPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    this.logger.log(`[MOCK] Creating payment: ${JSON.stringify(params)}`);

    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate PIX payment
    if (params.method === PaymentMethod.PIX) {
      return {
        payment_id: mockId,
        status: 'pending',
        qr_code: '00020126330014BR.GOV.BCB.PIX0114+5551999999999520400005303986540510.005802BR5925Nome Completo do Titular6009SAO PAULO62070503***63045D3E',
        qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
    }

    // Simulate credit/debit card payment (instant approval)
    return {
      payment_id: mockId,
      status: 'approved',
      external_url: `https://mock-payment.com/${mockId}`,
    };
  }

  private async createMercadoPagoPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    this.logger.log(`Creating Mercado Pago payment: ${params.job_code}`);

    const mercadoPagoUrl = 'https://api.mercadopago.com/v1/payments';

    const paymentData: any = {
      transaction_amount: params.amount / 100, // Convert centavos to reais
      description: params.description,
      payment_method_id: params.method === PaymentMethod.PIX ? 'pix' : 'credit_card',
      payer: {
        email: params.payer_email,
      },
      external_reference: params.job_code,
    };

    // Add installments for credit card
    if (params.method === PaymentMethod.CREDIT_CARD && params.installments) {
      paymentData.installments = params.installments;
    }

    try {
      const response = await fetch(mercadoPagoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mercadoPagoAccessToken}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Mercado Pago error: ${JSON.stringify(errorData)}`);
        throw new Error(`Mercado Pago API error: ${errorData.message}`);
      }

      const data = await response.json();

      return {
        payment_id: data.id,
        status: data.status,
        qr_code: data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
        expires_at: data.date_of_expiration ? new Date(data.date_of_expiration) : undefined,
        external_url: data.transaction_details?.external_resource_url,
      };
    } catch (error) {
      this.logger.error('Mercado Pago payment creation failed', error);
      throw error;
    }
  }
}
