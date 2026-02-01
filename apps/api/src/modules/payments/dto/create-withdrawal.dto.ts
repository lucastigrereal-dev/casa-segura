import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_CONFIG } from '@casa-segura/shared';

export class CreateWithdrawalDto {
  @ApiProperty({
    example: 10000,
    description: 'Valor do saque em centavos (R$ 100,00)',
    minimum: PAYMENT_CONFIG.minWithdrawalAmount
  })
  @IsInt()
  @Min(PAYMENT_CONFIG.minWithdrawalAmount)
  amount!: number;

  @ApiProperty({
    example: 'meu@email.com',
    description: 'Chave PIX (email, telefone, CPF ou chave aleatória)'
  })
  @IsString()
  pix_key!: string;
}
