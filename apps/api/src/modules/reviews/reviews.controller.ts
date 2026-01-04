import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar avaliação' })
  create(
    @CurrentUser('sub') userId: string,
    @Body()
    data: {
      job_id: string;
      reviewed_id: string;
      rating_overall: number;
      rating_punctuality?: number;
      rating_quality?: number;
      rating_friendliness?: number;
      comment?: string;
    },
  ) {
    return this.reviewsService.create({
      reviewer_id: userId,
      ...data,
    });
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter avaliação por ID do chamado' })
  findByJobId(@Param('jobId') jobId: string) {
    return this.reviewsService.findByJobId(jobId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Minhas avaliações' })
  @ApiQuery({ name: 'type', enum: ['given', 'received'] })
  getMyReviews(
    @CurrentUser('sub') userId: string,
    @Query('type') type: 'given' | 'received' = 'received',
  ) {
    return this.reviewsService.findByUserId(userId, type);
  }

  @Public()
  @Get('professional/:userId')
  @ApiOperation({ summary: 'Avaliações de um profissional' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  getProfessionalReviews(
    @Param('userId') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.reviewsService.getProfessionalReviews(userId, { skip, take });
  }
}
