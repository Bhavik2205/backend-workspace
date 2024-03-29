import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { DocumentEntity, ParticipateEntity } from "@entities";
import * as l10n from "jm-ez-l10n";

export class DocumentMiddleware {
  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

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
      console.log("document", document);

      const uploadedparticipant = await this.participateRepository.findOne({
        where: {
          userId: document.userId,
          workspaceId,
        },
      });
      console.log("uploadedparticipant", uploadedparticipant);

      const userParticipate = await this.participateRepository.findOne({
        where: {
          userId: me.id,
          workspaceId,
        },
      });
      console.log("userParticipate", userParticipate);

      if (uploadedparticipant.teamId === userParticipate.teamId) {
        return next();
      }

      return res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
}
