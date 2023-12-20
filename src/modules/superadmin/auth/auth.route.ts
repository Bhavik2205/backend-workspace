import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { SuperAdminAuthController } from "./auth.controller";
import { LoginDto, SignupDto } from "./dto";
import { UpdatePasswordDto } from "./dto/UpdatePassword.dto";
import { UpdateEmailDto } from "./dto/UpdateEmail.dto";
import { ForgotPasswordDto } from "./dto/ForgotPassword.dto";
import { ResetPasswordDto } from "./dto/ResetPassword.dto";
import { InviteUserDto } from "./dto/Invite.dto";
import { ResendInviteDto } from "./dto/ResendInvitation.dto";
import { InviteSignupDto } from "./dto/InviteSignup.dto";

export class SuperAdminAuthRouter extends SFRouter implements RouterDelegates {
    @InjectCls(SuperAdminAuthController)
    private adminController: SuperAdminAuthController

    @InjectCls(AuthMiddleware)
    private authMiddleware: AuthMiddleware

    initRoutes(): void {
        this.router.post('/signup', Validator.validate(SignupDto), this.adminController.signup);
        this.router.post('/signin', Validator.validate(LoginDto), this.adminController.login);
        this.router.patch('/change-email', Validator.validate(UpdateEmailDto), this.authMiddleware.auth, this.adminController.changeEmail);
        this.router.patch('/change-password', Validator.validate(UpdatePasswordDto), this.authMiddleware.auth, this.adminController.changePassword);
        this.router.post('/forgot-password', Validator.validate(ForgotPasswordDto), this.adminController.forgotPassword);
        this.router.patch('/reset-password/:token', Validator.validate(ResetPasswordDto), this.adminController.resetPasswordwithToken);
        this.router.post('/invite-member', this.authMiddleware.auth, Validator.validate(InviteUserDto), this.adminController.inviteMembers);
        this.router.post('/resend-invitation', this.authMiddleware.auth, Validator.validate(ResendInviteDto), this.adminController.resendInvitation);
        this.router.post('/remove/:id', this.authMiddleware.auth, this.adminController.removeMember);
        this.router.post('/invitation/signup/:id', Validator.validate(InviteSignupDto), this.adminController.inviteSignup);
        this.router.post('/verify/:id', this.adminController.verifyEmail);
        this.router.get('/members', this.authMiddleware.auth, this.adminController.getUserslist);
    }
}