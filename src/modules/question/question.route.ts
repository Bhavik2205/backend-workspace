import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, isWorkspaceExist } from "@middlewares";
import { QuestionController } from "./question.controller";
import { CreateQuestionDto, CreateAnswerDto } from "./dto";

export class QuestionRouter extends SFRouter implements RouterDelegates {
  @InjectCls(QuestionController)
  private workspaceController: QuestionController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateQuestionDto), this.authMiddleware.auth, isWorkspaceExist(), this.workspaceController.create);
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.workspaceController.read);
    this.router.get("/:questionId", this.authMiddleware.auth, isWorkspaceExist(), this.workspaceController.readOne);
    this.router.delete("/:questionId", this.authMiddleware.auth, this.workspaceController.delete);
    this.router.post("/answer/:questionId", Validator.validate(CreateAnswerDto), this.authMiddleware.auth, this.workspaceController.createAnswer);
  }
}
