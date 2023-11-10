import fileUpload from "express-fileupload";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { Constants } from "@configs";
import { ProfileController } from "./profile.controller";
import { UpdateEmailDto, UpdateNameDto, UpdateMobileDto, UpdateCompanyDto, UpdatePasswordDto } from "./dto";

export class ProfileRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ProfileController)
  private profileController: ProfileController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/", this.authMiddleware.auth, this.profileController.read);
    this.router.put("/update-email", Validator.validate(UpdateEmailDto), this.authMiddleware.auth, this.profileController.updateEmail);
    this.router.put("/update-name", Validator.validate(UpdateNameDto), this.authMiddleware.auth, this.profileController.updateName);
    this.router.put("/update-mobile", Validator.validate(UpdateMobileDto), this.authMiddleware.auth, this.profileController.updateMobile);
    this.router.put("/update-company", Validator.validate(UpdateCompanyDto), this.authMiddleware.auth, this.profileController.updateCompanyName);
    this.router.put("/update-password", Validator.validate(UpdatePasswordDto), this.authMiddleware.auth, this.profileController.updatePassword);
    this.router.delete("/", this.authMiddleware.auth, this.profileController.delete);
    this.router.post(
      "/image",
      fileUpload(),
      Validator.fileMimeValidate,
      this.authMiddleware.auth,
      this.profileController.uploadImage,
    );
    this.router.post("/2FA", this.authMiddleware.auth, this.profileController.update2fa);
  }
}
