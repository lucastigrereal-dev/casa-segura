import { IsEmail, IsString, MinLength, IsOptional, IsIn, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: '54999999999' })
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone inválido' })
  phone!: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name!: string;

  @ApiPropertyOptional({ enum: ['CLIENT', 'PROFESSIONAL'] })
  @IsOptional()
  @IsIn(['CLIENT', 'PROFESSIONAL'], { message: 'Role inválido' })
  role?: 'CLIENT' | 'PROFESSIONAL';

  @ApiPropertyOptional({ example: 'CASA-LUCAS-ABC123' })
  @IsOptional()
  @IsString()
  referral_code?: string;
}
