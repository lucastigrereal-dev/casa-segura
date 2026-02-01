import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveWithdrawalDto {
  @ApiProperty({ example: true, description: 'true para aprovar, false para rejeitar' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({
    example: 'Saldo insuficiente no momento',
    description: 'Motivo da rejeição (obrigatório se approve = false)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}
