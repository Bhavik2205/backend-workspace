import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { WorkspaceEntity } from "@entities";
import * as l10n from "jm-ez-l10n";

export class SettingMiddleware {
  @InitRepository(WorkspaceEntity)
  workspaceRepository: Repository<WorkspaceEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public setting = async (req: TRequest, res: TResponse, next: () => void) => {
    const { workspaceId } = req.params;
    const { me } = req;

    try {
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: +workspaceId,
          userId: me.id
        },
      });
        
      if (workspace) {
        return next();
      }

      return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
}
