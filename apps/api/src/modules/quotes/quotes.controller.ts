import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotesService, CreateQuoteDto } from './quotes.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '@casa-segura/database';

@ApiTags('quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Profissional envia orçamento' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body()
    data: {
      job_id: string;
      amount: number;
      notes?: string;
      available_dates: string[];
    },
  ) {
    return this.quotesService.create({
      ...data,
      professional_id: userId,
    });
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Listar orçamentos de um job' })
  async findByJob(@Param('jobId') jobId: string, @CurrentUser('sub') userId: string) {
    return this.quotesService.findByJobId(jobId, userId);
  }

  @Get('my')
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Meus orçamentos enviados' })
  async findMyQuotes(@CurrentUser('sub') userId: string) {
    return this.quotesService.findMyQuotes(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter orçamento por ID' })
  async findById(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }

  @Patch(':id/accept')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cliente aceita orçamento' })
  async acceptQuote(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quotesService.acceptQuote(id, userId);
  }

  @Patch(':id/reject')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cliente recusa orçamento' })
  async rejectQuote(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() data: { reason?: string },
  ) {
    return this.quotesService.rejectQuote(id, userId, data.reason);
  }
}
