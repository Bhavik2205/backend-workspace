import { WorkspaceEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { CreateWorkspaceDto } from "./dto";

export class WorkspaceController {
  @InitRepository(WorkspaceEntity)
  workspaceRepository: Repository<WorkspaceEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateWorkspaceDto>, res: TResponse) => {
    const { name, description, purpose, type } = req.dto;
    const { me } = req;

    const workspace = await this.workspaceRepository.create({
      name,
      description,
      purpose,
      type,
      userId: me.id,
    });

    await this.workspaceRepository.save(workspace);
    res.status(200).json({ msg: l10n.t("WORKSPACE_CREATE_SUCCESS"), data: workspace });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { page, limit } = req.pager;
    const { me } = req;

    const [data, count] = await this.workspaceRepository.findAndCount({
      where: {
        userId: me.id
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

  public readOne = async (req: TRequest, res: TResponse) => {
    const { workspaceId } = req.params;

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: +workspaceId,
      },
    });

    res.status(200).json({ data: workspace });
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { workspaceId } = req.params;

    await this.workspaceRepository.delete(workspaceId);

    res.status(200).json({ msg: l10n.t("WORKSPACE_DELETE_SUCCESS") });
  };
}
