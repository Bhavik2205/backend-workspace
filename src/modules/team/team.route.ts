import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, Participate, ParticipateMiddleware, PermissionsMiddleware, Subscription, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { TeamController } from "./team.controller";
import { CreateTeamDto, CreateMultipleParticipateDto, UpdateTeamDto } from "./dto";

export class TeamRouter extends SFRouter implements RouterDelegates {
  @InjectCls(TeamController)
  private teamController: TeamController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  @InjectCls(Participate)
  participate: Participate;

  @InjectCls(ParticipateMiddleware)
  addParticipate: ParticipateMiddleware;

  initRoutes(): void {
    this.router.post(
      "/",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AddDeleteTeam),
      this.subscription.team,
      Validator.validate(CreateTeamDto),
      isWorkspaceExist(),
      this.teamController.create,
    );
    this.router.get("/", this.authMiddleware.auth, this.subscription.isSubscribed, isWorkspaceExist(), this.teamController.read);
    this.router.post(
      "/participate/:teamId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.InviteParticipates),
      this.subscription.participate,
      this.addParticipate.add,
      Validator.validate(CreateMultipleParticipateDto),
      isWorkspaceExist(),
      this.teamController.createParticipates,
    );
    this.router.get("/participate", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.readParticipate);
    this.router.delete(
      "/:participateId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.RemoveParticipate),
      this.permission.acl(Permissions.RemoveParticipatesGlobally),
      this.participate.delete,
      this.teamController.deleteParticipate,
    );
    this.router.get("/user", this.authMiddleware.auth, this.subscription.isSubscribed, this.teamController.readUserTeam);
    this.router.get("/all-participate", this.authMiddleware.auth, this.subscription.isSubscribed, isWorkspaceExist(), this.teamController.readAllParticipate);
    this.router.put(
      "/team/:teamId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AddDeleteTeam),
      Validator.validate(UpdateTeamDto),
      isWorkspaceExist(),
      this.teamController.updateTeam,
    );
    this.router.delete(
      "/team/:teamId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AddDeleteTeam),
      isWorkspaceExist(),
      this.teamController.DeleteTeam,
    );
  }
}
