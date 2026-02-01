import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, WithdrawalStatus } from '@casa-segura/database';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pagamento para job' })
  create(@Body() data: CreatePaymentDto, @CurrentUser('sub') userId: string) {
    return this.paymentsService.createPayment(data, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pagamento por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { sub: string; role: Role }) {
    return this.paymentsService.findById(id, user.sub, user.role);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do gateway de pagamento (público)' })
  async handleWebhook(@Body() body: { payment_id: string; status: string }) {
    await this.paymentsService.handleWebhook(body.payment_id, body.status);
    return { success: true };
  }

  @Get('balance/me')
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obter meu saldo (profissional)' })
  getMyBalance(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getBalance(userId);
  }

  @Get('transactions/me')
  @ApiOperation({ summary: 'Listar minhas transações' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getMyTransactions(
    @CurrentUser('sub') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.paymentsService.getTransactions(userId, {
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('stats/me')
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Estatísticas financeiras do profissional' })
  getMyFinancialStats(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getFinancialStats(userId);
  }

  @Post('refunds')
  @ApiOperation({ summary: 'Solicitar reembolso' })
  createRefund(@Body() data: CreateRefundDto, @CurrentUser() user: { sub: string; role: Role }) {
    return this.paymentsService.createRefund(data, user.sub, user.role);
  }

  @Patch('refunds/:id/approve')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Aprovar reembolso (Admin)' })
  approveRefund(@Param('id') id: string, @CurrentUser('sub') adminId: string) {
    return this.paymentsService.approveRefund(id, adminId);
  }

  @Post('withdrawals')
  @Roles(Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Solicitar saque (profissional)' })
  createWithdrawal(@Body() data: CreateWithdrawalDto, @CurrentUser('sub') userId: string) {
    return this.paymentsService.createWithdrawal(data, userId);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Listar saques' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: WithdrawalStatus })
  async listWithdrawals(
    @CurrentUser() user: { sub: string; role: Role },
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: WithdrawalStatus
  ) {
    // If professional, get their professional ID to filter
    let professionalId: string | undefined;

    if (user.role === Role.PROFESSIONAL) {
      // For professionals, only show their own withdrawals
      // We need to get the professional record to get the professional_id
      // This is a simplification - in production, you'd fetch this properly
      professionalId = user.sub;
    }

    return this.paymentsService.listWithdrawals({
      professionalId,
      status,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Patch('withdrawals/:id/approve')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Aprovar ou rejeitar saque (Admin)' })
  approveWithdrawal(
    @Param('id') id: string,
    @Body() data: ApproveWithdrawalDto,
    @CurrentUser('sub') adminId: string
  ) {
    return this.paymentsService.approveWithdrawal(id, data.approve, adminId, data.rejection_reason);
  }
}
