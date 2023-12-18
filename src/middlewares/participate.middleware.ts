import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { ParticipateEntity, TeamEntity } from "@entities";
import * as l10n from "jm-ez-l10n";

export class ParticipateMiddleware {
  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public add = async (req: TRequest, res: TResponse, next: () => void) => {
    try {
      const { workspaceid: workspaceId } = req.headers;
      const { me } = req;
      const participantsData = req.body.participatesData;
      const { teamId } = req.params;

      const promises = participantsData.map(async (participantData: any) => {
        const { roleId } = participantData;

        const userRole = await this.participateRepository.findOne({
          where: {
            workspaceId,
            userId: me.id,
          },
        });
        console.log("userRole", userRole);

        const userTeam = await this.teamRepository.findOne({
          where: {
            workspaceId,
            id: userRole.teamId,
          },
        });
        console.log("userTeam", userTeam);

        const invitedTeam = await this.teamRepository.findOne({
          where: {
            workspaceId,
            id: +teamId,
          },
        });
        console.log("invitedTeam", invitedTeam);

        if (roleId === 1) {
          if (invitedTeam.name === "Internal Team") {
            if (userRole.roleId !== 1 && userTeam.name !== "Internal Team") {
              return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
            }
          } else {
            return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
          }
        }
        return next();
      });

      await Promise.all(promises);
      return res;
    } catch (error) {
      return res.status(400).json({ msg: l10n.t(error.message) });
    }
  };
}
