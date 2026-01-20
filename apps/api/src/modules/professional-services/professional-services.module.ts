import { Module } from '@nestjs/common';
import { ProfessionalServicesService } from './professional-services.service';
import { ProfessionalServicesController } from './professional-services.controller';

@Module({
  controllers: [ProfessionalServicesController],
  providers: [ProfessionalServicesService],
  exports: [ProfessionalServicesService],
})
export class ProfessionalServicesModule {}
