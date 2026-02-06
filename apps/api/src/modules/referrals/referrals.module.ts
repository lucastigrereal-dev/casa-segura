import { Module, forwardRef } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { CreditsService } from './credits.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  providers: [ReferralsService, CreditsService],
  controllers: [ReferralsController],
  exports: [ReferralsService, CreditsService],
})
export class ReferralsModule {}
