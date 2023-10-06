import { CategoryEntity } from "@entities";
import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest } from "@types";
import { Repository } from "typeorm";
import { InitRepository, InjectRepositories } from "@helpers";
import { CreateCategoryDto } from "./dto";

export class CategoryController {
  @InitRepository(CategoryEntity)
  categoryRepository: Repository<CategoryEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateCategoryDto>, res: TResponse) => {
    const { name } = req.dto;
    const { workspaceid: workspaceId } = req.headers;

    const category = await this.categoryRepository.create({
      name,
      workspaceId,
    });

    await this.categoryRepository.save(category);
    res.status(200).json({ msg: l10n.t("CATEGORY_CREATE_SUCCESS"), data: category });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { page, limit } = req.pager;
    const { workspaceid: workspaceId } = req.headers;

    const [data, count] = await this.categoryRepository.findAndCount({
      where: {
        workspaceId,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    res.status(200).json({
      data,
      count,
      limit,
    });
  };
}
