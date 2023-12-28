import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware, Subscription, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { QuestionController } from "./question.controller";
import { CreateQuestionDto, CreateAnswerDto, UpdateQuestionDto } from "./dto";

export class QuestionRouter extends SFRouter implements RouterDelegates {
  @InjectCls(QuestionController)
  private questionController: QuestionController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  initRoutes(): void {
    this.router.post(
      "/",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.CreateNewQA),
      this.subscription.questionAnswerAccess,
      Validator.validate(CreateQuestionDto),
      isWorkspaceExist(),
      this.questionController.create,
    );
    this.router.get(
      "/",
      this.authMiddleware.auth,
      this.permission.acl(Permissions.ViewQA),
      this.subscription.questionAnswerAccess,
      isWorkspaceExist(),
      this.questionController.read,
    );
    this.router.get(
      "/:questionId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.ViewQA),
      this.subscription.questionAnswerAccess,
      isWorkspaceExist(),
      this.questionController.readOne,
    );
    this.router.delete(
      "/:questionId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.DeleteQA),
      this.subscription.questionAnswerAccess,
      this.questionController.delete,
    );
    this.router.post(
      "/answer/:questionId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AnswerQA),
      this.subscription.questionAnswerAccess,
      Validator.validate(CreateAnswerDto),
      this.questionController.createAnswer,
    );
    this.router.put(
      "/:questionId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.EditQA),
      this.subscription.questionAnswerAccess,
      Validator.validate(UpdateQuestionDto),
      isWorkspaceExist(),
      this.questionController.update,
    );
    this.router.post("/:questionId/close-thread", this.authMiddleware.auth, this.permission.acl(Permissions.CreateNewQA), isWorkspaceExist(), this.questionController.closeThread);
  }
}
