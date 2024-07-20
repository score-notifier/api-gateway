import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

// TODO:
// Implement Pagination on the API Gateway and the microservices
export class PaginationDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
