import fileUpload from "express-fileupload";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware, PermissionsMiddleware, Subscription } from "@middlewares";
import { Constants } from "@configs";
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

  initRoutes(): void {
    this.router.post(
      "/",
      fileUpload({
        limits: { fileSize: Constants.MAX_FILE_SIZE },
      }),
      Validator.fileMimeValidate,
      Validator.fileSizeValidate,
      this.authMiddleware.auth,
      this.permission.acl(Permissions.DocumentUpload),
      this.subscription.document,
      Validator.validate(CreateDocumentDto),
      isWorkspaceExist(),
      this.documentController.create,
    );
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.documentController.read);
    this.router.delete("/:documentId", this.authMiddleware.auth, this.permission.acl(Permissions.DocumentDownload), this.documentController.delete);
    this.router.get("/search", this.authMiddleware.auth, this.permission.acl(Permissions.DocumentSearch), isWorkspaceExist(), this.documentController.search);
    this.router.put(
      "/:documentId",
      fileUpload({
        limits: { fileSize: Constants.MAX_FILE_SIZE },
      }),
      Validator.fileMimeValidate,
      Validator.fileSizeValidate,
      this.authMiddleware.auth,
      this.permission.acl(Permissions.DocumentUpload),
      Validator.validate(UpdateDocumentDto),
      isWorkspaceExist(),
      this.documentController.edit,
    );
  }
}
