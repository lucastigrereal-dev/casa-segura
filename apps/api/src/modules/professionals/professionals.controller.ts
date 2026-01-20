import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfessionalsService } from './professionals.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { Role, ProLevel } from '@casa-segura/database';

@ApiTags('professionals')
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar profissionais' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'level', required: false, enum: ProLevel })
  @ApiQuery({ name: 'isAvailable', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('level') level?: ProLevel,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.professionalsService.findAll({
      skip,
      take,
      level,
      isAvailable,
      categoryId,
      search,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas de profissionais (Admin)' })
  getStats() {
    return this.professionalsService.getStats();
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas do profissional atual' })
  getMyStats(@CurrentUser('sub') userId: string) {
    return this.professionalsService.getMyStats(userId);
  }

  @Get('me/earnings')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganhos e extrato do profissional' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  getMyEarnings(
    @CurrentUser('sub') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.professionalsService.getMyEarnings(userId, { skip, take });
  }

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar disponibilidade do profissional' })
  toggleAvailability(
    @CurrentUser('sub') userId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.professionalsService.toggleAvailability(userId, isAvailable);
  }

  @Patch('me/radius')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar raio de atuação do profissional' })
  updateRadius(
    @CurrentUser('sub') userId: string,
    @Body('work_radius_km') workRadiusKm: number,
  ) {
    return this.professionalsService.updateRadius(userId, workRadiusKm);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do profissional atual' })
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.professionalsService.findByUserId(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter profissional por ID' })
  findOne(@Param('id') id: string) {
    return this.professionalsService.findById(id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar-se como profissional' })
  register(@CurrentUser('sub') userId: string) {
    return this.professionalsService.create(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do profissional' })
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: { pix_key?: string; is_available?: boolean; work_radius_km?: number },
  ) {
    const professional = await this.professionalsService.findByUserId(userId);
    if (!professional) {
      throw new Error('Profissional não encontrado');
    }
    return this.professionalsService.update(professional.id, data);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar verificação (Admin)' })
  updateVerification(
    @Param('id') id: string,
    @Body()
    data: {
      cpf_verified?: boolean;
      selfie_verified?: boolean;
      address_verified?: boolean;
    },
  ) {
    return this.professionalsService.updateVerification(id, data);
  }

  @Patch(':id/level')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar nível do profissional (Admin)' })
  updateLevel(@Param('id') id: string, @Body('level') level: ProLevel) {
    return this.professionalsService.updateLevel(id, level);
  }

  @Post(':id/specialties/:specialtyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar especialidade' })
  addSpecialty(
    @Param('id') id: string,
    @Param('specialtyId') specialtyId: string,
  ) {
    return this.professionalsService.addSpecialty(id, specialtyId);
  }
}
