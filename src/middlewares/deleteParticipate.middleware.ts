import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { ParticipateEntity, TeamEntity } from "@entities";
import * as l10n from "jm-ez-l10n";

export class Participate {
  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public delete = async (req: TRequest, res: TResponse, next: () => void) => {
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;
    const { participateId } = req.params;

    try {
      const participateData = await this.participateRepository.findOne({
        where: {
          id: +participateId,
          workspaceId,
          userId: me.id,
        },
      });

      if (participateData) {
        const teamData = await this.teamRepository.findOne({
          where: {
            id: participateData.id,
            name: "Internal Team",
          },
        });

        if (teamData) {
          return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
        }
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.msg });
    }
  };
}
