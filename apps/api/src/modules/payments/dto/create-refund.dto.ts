import { IsString, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({ example: 'uuid-of-payment', description: 'ID do pagamento a ser reembolsado' })
  @IsString()
  payment_id!: string;

  @ApiProperty({ example: 10000, description: 'Valor do reembolso em centavos (R$ 100,00)' })
  @IsInt()
  @Min(100)
  amount!: number;

  @ApiProperty({ example: 'Cliente solicitou cancelamento do serviço', description: 'Motivo do reembolso' })
  @IsString()
  @MaxLength(500)
  reason!: string;
}
