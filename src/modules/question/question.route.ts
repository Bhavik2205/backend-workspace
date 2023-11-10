import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { QuestionController } from "./question.controller";
import { CreateQuestionDto, CreateAnswerDto, UpdateQuestionDto } from "./dto";

export class QuestionRouter extends SFRouter implements RouterDelegates {
  @InjectCls(QuestionController)
  private workspaceController: QuestionController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.post(
      "/",
      this.authMiddleware.auth,
      this.permission.acl(Permissions.CreateNewQA),
      Validator.validate(CreateQuestionDto),
      isWorkspaceExist(),
      this.workspaceController.create,
    );
    this.router.get("/", this.authMiddleware.auth, this.permission.acl(Permissions.ViewQA), isWorkspaceExist(), this.workspaceController.read);
    this.router.get("/:questionId", this.authMiddleware.auth, this.permission.acl(Permissions.ViewQA), isWorkspaceExist(), this.workspaceController.readOne);
    this.router.delete("/:questionId", this.authMiddleware.auth, this.permission.acl(Permissions.DeleteQA), this.workspaceController.delete);
    this.router.post("/answer/:questionId", Validator.validate(CreateAnswerDto), this.authMiddleware.auth, this.workspaceController.createAnswer);
    this.router.put("/:questionId", this.authMiddleware.auth, this.permission.acl(Permissions.EditQA), Validator.validate(UpdateQuestionDto), isWorkspaceExist(), this.workspaceController.update);
  }
}
