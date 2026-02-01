import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@casa-segura/database';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-job', description: 'ID do job a ser pago' })
  @IsString()
  job_id!: string;

  @ApiProperty({ enum: PaymentMethod, example: 'PIX', description: 'Método de pagamento' })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 12,
    description: 'Número de parcelas (apenas para cartão de crédito)'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  installments?: number;
}
