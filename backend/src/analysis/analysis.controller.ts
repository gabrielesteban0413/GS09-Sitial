import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AnalysisService } from "./analysis.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("analysis")
@Controller("analysis")
export class AnalysisController {
  constructor(private service: AnalysisService) {}

  @Post()
  create(@Body() dto: CreateAnalysisDto, @CurrentUser("id") userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  list(
    @CurrentUser("id") userId: string,
    @Query("page") page = "1",
    @Query("page_size") pageSize = "20",
  ) {
    return this.service.list(userId, parseInt(page, 10), parseInt(pageSize, 10));
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.service.remove(id, userId);
  }
}
