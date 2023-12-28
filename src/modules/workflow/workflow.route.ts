import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware, Subscription, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { WorkflowController } from "./workflow.controller";
import { CreateWorkflowDto, UpdateWorkflowDto, SetDueDateDto } from "./dto";

export class WorkflowRouter extends SFRouter implements RouterDelegates {
  @InjectCls(WorkflowController)
  private workflowController: WorkflowController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  initRoutes(): void {
    this.router.post(
      "/",
      Validator.validate(CreateWorkflowDto),
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AddTaskAndDueDate),
      this.subscription.WorkflowAccess,
      isWorkspaceExist(),
      this.workflowController.create,
    );
    this.router.get("/", this.authMiddleware.auth, this.subscription.WorkflowAccess, isWorkspaceExist(), this.workflowController.read);
    this.router.put(
      "/:workflowId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.EditTask),
      this.subscription.WorkflowAccess,
      Validator.validate(UpdateWorkflowDto),
      isWorkspaceExist(),
      this.workflowController.update,
    );
    this.router.delete(
      "/:workflowId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.DeleteTask),
      this.subscription.WorkflowAccess,
      isWorkspaceExist(),
      this.workflowController.delete,
    );
    this.router.put(
      "/duedate/:workflowId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AddTaskAndDueDate),
      this.subscription.WorkflowAccess,
      Validator.validate(SetDueDateDto),
      isWorkspaceExist(),
      this.workflowController.setDueDate,
    );
    this.router.delete(
      "/duedate/:workflowId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.AddTaskAndDueDate),
      this.subscription.WorkflowAccess,
      Validator.validate(SetDueDateDto),
      isWorkspaceExist(),
      this.workflowController.deleteDueDate,
    );
    this.router.get(
      "/download/:workflowId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.subscription.WorkflowAccess,
      isWorkspaceExist(),
      this.workflowController.download,
    );
  }
}
