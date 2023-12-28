import fileUpload from "express-fileupload";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware, PermissionsMiddleware, Subscription, WorkspaceType, DocumentMiddleware } from "@middlewares";
import { Permissions } from "@acl";
import { DocumentController } from "./document.controller";
import { CreateDocumentDto, UpdateDocumentDto } from "./dto";

export class DocumentRouter extends SFRouter implements RouterDelegates {
  @InjectCls(DocumentController)
  private documentController: DocumentController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  @InjectCls(WorkspaceType)
  workspaceType: WorkspaceType;

  @InjectCls(DocumentMiddleware)
  document: DocumentMiddleware;

  initRoutes(): void {
    this.router.post(
      "/",
      fileUpload(),
      Validator.fileMimeValidate,
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.DocumentUpload),
      this.subscription.document,
      this.workspaceType.document,
      this.subscription.documentAccess,
      Validator.validate(CreateDocumentDto),
      isWorkspaceExist(),
      this.documentController.create,
    );
    this.router.get("/", this.authMiddleware.auth, this.subscription.documentAccess, isWorkspaceExist(), this.documentController.read);
    this.router.delete(
      "/:documentId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.DocumentDownload),
      this.workspaceType.document,
      this.documentController.delete,
    );
    this.router.get(
      "/search",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.DocumentSearch),
      isWorkspaceExist(),
      this.documentController.search,
    );
    this.router.put(
      "/:documentId",
      fileUpload(),
      Validator.fileMimeValidate,
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.DocumentUpload),
      this.subscription.documentAccess,
      this.workspaceType.document,
      this.document.Edit,
      Validator.validate(UpdateDocumentDto),
      isWorkspaceExist(),
      this.documentController.edit,
    );
  }
}
