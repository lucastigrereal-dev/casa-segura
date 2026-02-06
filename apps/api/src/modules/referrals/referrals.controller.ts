import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReferralsService } from './referrals.service';
import { CreditsService } from './credits.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(
    private referralsService: ReferralsService,
    private creditsService: CreditsService,
  ) {}

  /**
   * GET /referrals/my-code
   * Retorna código de indicação do usuário
   */
  @Get('my-code')
  async getMyCode(@Request() req: any) {
    return this.referralsService.getMyReferralCode(req.user.userId);
  }

  /**
   * GET /referrals/my-stats
   * Estatísticas de indicações
   */
  @Get('my-stats')
  async getMyStats(@Request() req: any) {
    return this.referralsService.getMyReferralStats(req.user.userId);
  }

  /**
   * POST /referrals/validate
   * Valida código de indicação (antes de aplicar)
   */
  @Post('validate')
  async validateCode(@Body('code') code: string) {
    return this.referralsService.validateCode(code);
  }

  /**
   * POST /referrals/apply
   * Aplica código no cadastro (chamado pelo auth.service)
   */
  @Post('apply')
  async applyCode(@Request() req: any, @Body('code') code: string) {
    return this.referralsService.applyReferralCode(code, req.user.userId);
  }

  /**
   * GET /referrals/credits/balance
   * Saldo de créditos
   */
  @Get('credits/balance')
  async getBalance(@Request() req: any) {
    return this.creditsService.getBalance(req.user.userId);
  }

  /**
   * GET /referrals/credits/transactions
   * Histórico de créditos
   */
  @Get('credits/transactions')
  async getTransactions(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.creditsService.getTransactions(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * POST /referrals/credits/apply-to-job
   * Aplica créditos em um job
   */
  @Post('credits/apply-to-job')
  async applyToJob(
    @Request() req: any,
    @Body('job_id') jobId: string,
    @Body('job_amount') jobAmount: number,
  ) {
    return this.creditsService.applyCreditsToJob(req.user.userId, jobId, jobAmount);
  }
}
