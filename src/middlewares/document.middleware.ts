import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { DocumentEntity, ParticipateEntity, TeamEntity } from "@entities";
import * as l10n from "jm-ez-l10n";

export class DocumentMiddleware {
  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public Edit = async (req: TRequest, res: TResponse, next: () => void) => {
    const { workspaceid: workspaceId } = req.headers;
    const { documentId } = req.params;
    const { me } = req;

    try {
      const document = await this.documentRepository.findOne({
        where: {
          id: +documentId,
          workspaceId,
        },
      });

      const uploadedparticipant = await this.participateRepository.findOne({
        where: {
          userId: document.userId,
          workspaceId,
        },
      });

      const uploadedteam = await this.teamRepository.findOne({
        where: {
          id: uploadedparticipant.teamId,
          workspaceId,
        },
      });

      const userParticipate = await this.participateRepository.findOne({
        where: {
          userId: me.id,
          workspaceId,
        },
      });

      const userTeam = await this.teamRepository.findOne({
        where: {
          id: userParticipate.teamId,
          workspaceId,
        },
      });

      if (uploadedteam.name === userTeam.name) {
        return next();
      }

      return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
}
