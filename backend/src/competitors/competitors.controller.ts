import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CompetitorsService } from "./competitors.service";
import { SearchCompetitorsDto } from "./dto/search-competitors.dto";

@ApiTags("competitors")
@Controller("competitors")
export class CompetitorsController {
  constructor(private service: CompetitorsService) {}

  @Post("search")
  search(@Body() dto: SearchCompetitorsDto) {
    return this.service.search(dto);
  }
}
