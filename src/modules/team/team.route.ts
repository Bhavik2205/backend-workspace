import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, isWorkspaceExist } from "@middlewares";
import { TeamController } from "./team.controller";
import { CreateTeamDto, CreateMultipleParticipateDto } from "./dto";

export class TeamRouter extends SFRouter implements RouterDelegates {
  @InjectCls(TeamController)
  private teamController: TeamController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateTeamDto), this.authMiddleware.auth, isWorkspaceExist(), this.teamController.create);
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.read);
    this.router.post(
      "/participate/:teamId",
      Validator.validate(CreateMultipleParticipateDto),
      this.authMiddleware.auth,
      isWorkspaceExist(),
      this.teamController.createParticipates,
    );
    this.router.get("/participate", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.readParticipate);
    this.router.delete("/:participateId", this.authMiddleware.auth, this.teamController.deleteParticipate);
    this.router.get("/user", this.authMiddleware.auth, this.teamController.readUserTeam);
    this.router.get("/all-participate", this.authMiddleware.auth, isWorkspaceExist(), this.teamController.readAllParticipate);
  }
}
