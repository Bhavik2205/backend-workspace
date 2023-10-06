import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { CreateUserDto, ForgotPasswordDto, ResetPasswordDto, SendTwoFactorDto, SignInDto, VerifyTwoFactorDto } from "./dto";
import { AuthController } from "./auth.controller";

export class AuthRouter extends SFRouter implements RouterDelegates {
  @InjectCls(AuthController)
  private userController: AuthController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/sign-up", Validator.validate(CreateUserDto), this.userController.create);
    this.router.post("/sign-in", Validator.validate(SignInDto), this.userController.signIn);
    this.router.post("/forgot-password", Validator.validate(ForgotPasswordDto), this.userController.forgotPassword);
    this.router.post("/reset-password/:token", Validator.validate(ResetPasswordDto), this.userController.resetPassword);
    this.router.post("/send-two-factor", Validator.validate(SendTwoFactorDto), this.authMiddleware.auth, this.userController.sendTwoFactor);
    this.router.post("/enable-two-factor", Validator.validate(SendTwoFactorDto), this.authMiddleware.auth, this.userController.sendTwoFactor);
    this.router.post("/verify-two-factor", Validator.validate(VerifyTwoFactorDto), this.authMiddleware.auth, this.userController.verifyTwoFactor);
  }
}
