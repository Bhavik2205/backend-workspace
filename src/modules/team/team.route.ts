import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { TeamController } from "./team.controller";
import { CreateTeamDto, CreateMultipleParticipateDto } from "./dto";

export class TeamRouter extends SFRouter implements RouterDelegates {
  @InjectCls(TeamController)
  private teamController: TeamController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.post(
      "/",
      this.authMiddleware.auth,
      this.permission.acl(Permissions.AddDeleteTeam),
      Validator.validate(CreateTeamDto),
      isWorkspaceExist(),
      this.teamController.create,
    );
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.read);
    this.router.post(
      "/participate/:teamId",
      this.authMiddleware.auth,
      this.permission.acl(Permissions.InviteParticipates),
      Validator.validate(CreateMultipleParticipateDto),
      isWorkspaceExist(),
      this.teamController.createParticipates,
    );
    this.router.get("/participate", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.readParticipate);
    this.router.delete(
      "/:participateId",
      this.authMiddleware.auth,
      this.permission.acl(Permissions.RemoveParticipate),
      this.permission.acl(Permissions.RemoveParticipatesGlobally),
      this.teamController.deleteParticipate,
    );
    this.router.get("/user", this.authMiddleware.auth, this.teamController.readUserTeam);
    this.router.get("/all-participate", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.readAllParticipate);
  }
}
