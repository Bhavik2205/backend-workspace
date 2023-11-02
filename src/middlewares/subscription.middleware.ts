import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { DocumentEntity, ParticipateEntity, TeamEntity, UserEntity } from "@entities";

export class Subscription {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public team = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const teamCount = await this.teamRepository.count({
        where: {
          workspaceId,
        },
      });

      const maxTeamsByPlanId: {
        [key: number]: number;
      } = {
        1: 4,
        2: 3,
        3: 2,
      };

      const hasReachedMaxTeams = user && teamCount === maxTeamsByPlanId[user.planId];

      if (hasReachedMaxTeams) {
        return res.status(400).json({ error: "Maximum number of teams reached for this workspace" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.msg });
    }
  };

  public participate = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const participantCount = await this.participateRepository.count({
        where: {
          workspaceId,
        },
      });

      const maxParticipatesByPlanId: {
        [key: number]: number;
      } = {
        1: 18,
        2: 9,
        3: 2,
      };

      const hasReachedMaxUsers = user && participantCount === maxParticipatesByPlanId[user.planId];

      if (hasReachedMaxUsers) {
        return res.status(400).json({ error: "Maximum number of user reached for this workspace" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.msg });
    }
  };

  public document = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const documentCount = await this.documentRepository.find({
        where: {
          workspaceId,
        },
      });      

      const totalSize = documentCount.reduce((acc, document) => acc + Number(document.size), 0);

      const maxDocSizeByPlanId: {
        [key: number]: number;
      } = {
        1: 10737418240,
        2: 5368709120,
        3: 104857600,
      };

      const hasReachedMaxDocSize = user && totalSize === maxDocSizeByPlanId[user.planId];

      if (hasReachedMaxDocSize) {
        return res.status(400).json({ error: "Maximum storage space reached for this workspace" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.msg });
    }
  };
}
