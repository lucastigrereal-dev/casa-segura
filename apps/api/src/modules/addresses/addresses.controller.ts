import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar meus endereços' })
  findMyAddresses(@CurrentUser('sub') userId: string) {
    return this.addressesService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter endereço por ID' })
  findOne(@Param('id') id: string) {
    return this.addressesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar endereço' })
  create(
    @CurrentUser('sub') userId: string,
    @Body()
    data: {
      label?: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state?: string;
      zip_code: string;
      latitude?: number;
      longitude?: number;
      is_default?: boolean;
    },
  ) {
    return this.addressesService.create({
      user_id: userId,
      ...data,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body()
    data: {
      label?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      latitude?: number;
      longitude?: number;
      is_default?: boolean;
    },
  ) {
    return this.addressesService.update(id, userId, data);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Definir como endereço padrão' })
  setDefault(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.addressesService.setDefault(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir endereço' })
  delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.addressesService.delete(id, userId);
  }
}
