import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest } from "@types";
import { InitRepository, InjectRepositories, JwtHelper } from "@helpers";
import { Repository } from "typeorm";
import { ParticipateEntity, RolesEntity, UserRolesEntity, WorkspaceEntity } from "@entities";

export class PermissionsMiddleware {
  @InitRepository(UserRolesEntity)
  userRolesRepository: Repository<UserRolesEntity>;

  @InitRepository(RolesEntity)
  roleRepository: Repository<RolesEntity>;

  @InitRepository(WorkspaceEntity)
  workspaceRepository: Repository<WorkspaceEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public acl(permission: string) {
    return async (req: TRequest, res: TResponse, next: () => void) => {
      const { workspaceid: workspaceId } = req.headers;
      const user = JwtHelper.decode<any>(req.headers.authorization.replace("Bearer ", ""));

      if (!user) {
        return { code: 401, reason: l10n.t("ERR_USER_NOT_EXIST") };
      }

      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: workspaceId,
          userId: user.id,
        },
      });

      if (!workspace) {
        const participate = await this.participateRepository.findOne({
          where: {
            userId: user.id,
            workspaceId,
          },
          select: ["roleId"],
        });

        const rolePermissions = await this.roleRepository.find({
          where: {
            id: participate.roleId,
          },
          select: ["permission"],
        });

        const permissions = rolePermissions.map(role => role.permission);
        const userPermissions = [].concat(...permissions);
        const canAccess = userPermissions.includes(permission);

        if (!canAccess) {
          res.status(403).json({ error: l10n.t("ERR_PERMISSION_DENIED") });
        }
        req.me = user;
        return next();
      }
      return next();
    };
  }
}
