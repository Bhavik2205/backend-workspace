import fileUpload from "express-fileupload";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware } from "@middlewares";
import { Constants } from "@configs";
import { DocumentController } from "./document.controller";
import { CreateDocumentDto } from "./dto";

export class DocumentRouter extends SFRouter implements RouterDelegates {
  @InjectCls(DocumentController)
  private documentController: DocumentController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post(
      "/",
      fileUpload({
        limits: { fileSize: Constants.MAX_FILE_SIZE },
      }),
      Validator.fileMimeValidate,
      Validator.fileSizeValidate,
      Validator.validate(CreateDocumentDto),
      this.authMiddleware.auth,
      isWorkspaceExist(),
      this.documentController.create,
    );
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.documentController.read);
    this.router.delete("/:documentId", this.authMiddleware.auth, this.documentController.delete);
    this.router.get("/search", this.authMiddleware.auth, isWorkspaceExist(), this.documentController.search);
  }
}
