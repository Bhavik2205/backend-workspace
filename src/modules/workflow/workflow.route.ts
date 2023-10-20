import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, isWorkspaceExist } from "@middlewares";
import { WorkflowController } from "./workflow.controller";
import { CreateWorkflowDto, UpdateWorkflowDto, SetDueDateDto } from "./dto";

export class WorkflowRouter extends SFRouter implements RouterDelegates {
  @InjectCls(WorkflowController)
  private workflowController: WorkflowController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateWorkflowDto), this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.create);
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.read);
    this.router.put("/:workflowId", Validator.validate(UpdateWorkflowDto), this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.update);
    this.router.delete("/:workflowId", this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.delete);
    this.router.put("/duedate/:workflowId", Validator.validate(SetDueDateDto), this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.setDueDate);
    this.router.delete("/duedate/:workflowId", this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.deleteDueDate);
    this.router.get("/download/:workflowId", this.authMiddleware.auth, isWorkspaceExist(), this.workflowController.download);
  }
}
