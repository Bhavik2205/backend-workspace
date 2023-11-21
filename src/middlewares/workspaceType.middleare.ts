import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { DocumentEntity, ParticipateEntity, TeamEntity, WorkspaceEntity } from "@entities";
import * as l10n from "jm-ez-l10n";

export class WorkspaceType {
  @InitRepository(WorkspaceEntity)
  workspaceRepository: Repository<WorkspaceEntity>;

  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;
    
  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;
    
  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public document = async (req: TRequest, res: TResponse, next: () => void) => {
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    try {
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: workspaceId
        }
      })
        
      const data = await this.participateRepository.findOne({
        where: {
          userId: me.id,
        },
      });
        
      const team = await this.teamRepository.findOne({
        where: {
          id: data.teamId
        }
      })
               
      if (workspace.type === "One Way" && team.name === "External Team") {
        return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.msg });
    }
  };

}
