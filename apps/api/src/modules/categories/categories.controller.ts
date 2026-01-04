import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';
import { Role } from '@casa-segura/database';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiQuery({ name: 'includeInactive', required: false })
  findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.categoriesService.findAll(includeInactive);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obter categoria por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar categoria (Admin)' })
  create(
    @Body()
    data: {
      name: string;
      slug: string;
      icon?: string;
      color?: string;
      order?: number;
    },
  ) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria (Admin)' })
  update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      slug?: string;
      icon?: string;
      color?: string;
      is_active?: boolean;
      order?: number;
    },
  ) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir categoria (Admin)' })
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
