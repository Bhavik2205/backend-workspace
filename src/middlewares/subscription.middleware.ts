import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { DocumentEntity, ParticipateEntity, SubscriptionPlanEntity, TeamEntity, UserEntity, UserRolesEntity, WorkspaceEntity } from "@entities";
import * as l10n from "jm-ez-l10n";
import axios from "axios";

export class Subscription {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;

  @InitRepository(UserRolesEntity)
  userRolesRepository: Repository<UserRolesEntity>;

  @InitRepository(WorkspaceEntity)
  workspaceRepository: Repository<WorkspaceEntity>;

  @InitRepository(SubscriptionPlanEntity)
  subscriptionPlanRepository: Repository<SubscriptionPlanEntity>;

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

      const planDetail = await this.subscriptionPlanRepository.findOne({
        where: {
          id: user.planId,
        },
      });

      const planData = planDetail.feature as any as { team?: number }[];
      const totalTeam = planData.find(e => e?.team !== undefined)?.team;

      const hasReachedMaxTeams = teamCount >= totalTeam;

      if (hasReachedMaxTeams) {
        return res.status(400).json({ error: "Maximum number of teams reached for this workspace" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.message });
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

      const planDetail = await this.subscriptionPlanRepository.findOne({
        where: {
          id: user.planId,
        },
      });

      const planData = planDetail.feature as any as { user?: number }[];
      const totalUser = planData.find(e => e?.user !== undefined)?.user;

      const hasReachedMaxUsers = participantCount >= totalUser;

      if (hasReachedMaxUsers) {
        return res.status(400).json({ error: "Maximum number of user reached for this workspace" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public workspace = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const workspaceCount = await this.workspaceRepository.count({
        where: {
          userId: me.id,
        },
      });

      const planDetail = await this.subscriptionPlanRepository.findOne({
        where: {
          id: user.planId,
        },
      });

      const planData = planDetail.feature as any as { workspace?: number }[];
      const totalWorkspace = planData.find(e => e?.workspace !== undefined)?.workspace;

      const hasReachedMaxWorkspace = workspaceCount >= totalWorkspace;

      if (hasReachedMaxWorkspace) {
        return res.status(400).json({ error: "Maximum number of workspace reached" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.message });
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

      const totalSize = documentCount.reduce((acc, document) => acc + BigInt(document.size), BigInt(0));

      const existingPlanDetail = await this.subscriptionPlanRepository.findOne({
        where: {
          id: user.planId,
        },
      });

      const planData = existingPlanDetail.feature as any as { documentSize?: number }[];
      let totalDocumentSize: bigint = BigInt(planData.find(e => e?.documentSize !== undefined)?.documentSize || 0);

      const subscription = await axios.get("https://api.dev.workspace.tesseractsquare.com/subscriptions", {
        headers: {
          Authorization: req.headers.authorization,
        },
      });
      console.log(subscription);

      if (subscription?.data?.data?.plan?.slug === "additional-storage-space") {
        const additionalStoragePlan = await this.subscriptionPlanRepository.findOne({
          where: {
            id: subscription?.data?.data?.planId,
          },
        });
        const additionalStorageDetail = additionalStoragePlan.feature as any as { documentSize?: number }[];
        const additionalDocumentStorage = BigInt(additionalStorageDetail.find(e => e?.documentSize !== undefined)?.documentSize || 0);
        totalDocumentSize += additionalDocumentStorage;
      }

      const hasReachedMaxDocSize = totalSize >= totalDocumentSize;
      if (hasReachedMaxDocSize) {
        return res.status(400).json({ error: "Maximum storage space reached for this workspace" });
      }

      return next();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public documentAccess = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;
    const { documentId } = req.params;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const allowedPathsForPlan1And2 = ["/", `/${documentId}`, "/search"];
      const allowedMethodsForPlan1And2 = ["GET", "POST", "PUT", "DELETE"];
      const allowedPathsForPlan3 = ["/", "/search"];
      const allowedMethodsForPlan3 = ["GET", "POST", "DELETE"];

      if (user.planId === 1 || user.planId === 2) {
        if (allowedPathsForPlan1And2.includes(req.path) && allowedMethodsForPlan1And2.includes(req.method)) {
          return next();
        }
      } else if (user.planId === 3) {
        if (allowedPathsForPlan3.includes(req.path) && allowedMethodsForPlan3.includes(req.method)) {
          return next();
        }
      }

      return res.status(400).json({ error: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public questionAnswerAccess = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;
    const { questionId } = req.params;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const allowedPathsForPlan1And2 = ["/", `/${questionId}`, `/answer/${questionId}`];
      const allowedMethodsForPlan1And2 = ["GET", "POST", "DELETE", "PUT"];

      if (user.planId === 1 || user.planId === 2) {
        if (allowedPathsForPlan1And2.includes(req.path) && allowedMethodsForPlan1And2.includes(req.method)) {
          return next();
        }
      }

      return res.status(400).json({ error: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public LogsAccess = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const allowedPathsForPlan1And2 = ["/download"];
      const allowedMethodsForPlan1And2 = ["GET"];

      if (user.planId === 1 || user.planId === 2) {
        if (allowedPathsForPlan1And2.includes(req.path) && allowedMethodsForPlan1And2.includes(req.method)) {
          return next();
        }
      }

      return res.status(400).json({ error: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public WorkflowAccess = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;
    const { workflowId } = req.params;

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const allowedPathsForPlan1 = ["/", `/${workflowId}`, `/duedate/${workflowId}`, `/download/${workflowId}`];
      const allowedMethodsForPlan1 = ["GET", "POST", "PUT", "DELETE"];

      if (user.planId === 1) {
        if (allowedPathsForPlan1.includes(req.path) && allowedMethodsForPlan1.includes(req.method)) {
          return next();
        }
      }

      return res.status(400).json({ error: l10n.t("ERR_PERMISSION_DENIED") });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public isSubscribed = async (req: TRequest, res: TResponse, next: () => void) => {
    const { me } = req;

    const userData = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
    });

    if (!userData.planId) {
      return res.status(400).json({ error: l10n.t("NO_SUBSCRIPTION") });
    }

    return next();
  };
}
