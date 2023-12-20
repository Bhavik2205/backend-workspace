import { DeepPartial, MoreThanOrEqual, Not, Repository } from "typeorm";
import os from "os";
import * as l10n from "jm-ez-l10n";
import { v4 as uuidv4 } from "uuid";
import { Constants, env } from "@configs";
import { TRequest, TResponse, EUserType, ESStatus, EEmailVerificationStatus, EInvitedMemberStatus } from "@types";
import {
  Bcrypt,
  InitRepository,
  InjectRepositories,
  JwtHelper,
  Notification,
} from "@helpers";
import { InvitedUsersEntity, LoginInfoEntity, ResetPasswordRequestEntity, SuperadminUserEntity } from "../../../entities/superadmin/index";
import { LoginDto, SignupDto } from "./dto";
import { UpdatePasswordDto } from "./dto/UpdatePassword.dto";
import { ForgotPasswordDto } from "./dto/ForgotPassword.dto";
import { ResetPasswordDto } from "./dto/ResetPassword.dto";
import moment from "moment";
import { InviteUserDto } from "./dto/Invite.dto";
import { ResendInviteDto } from "./dto/ResendInvitation.dto";
import { InviteSignupDto } from "./dto/InviteSignup.dto";

export class SuperAdminAuthController {
  @InitRepository(SuperadminUserEntity)
  adminuserRepository: Repository<SuperadminUserEntity>;

  @InitRepository(LoginInfoEntity)
  loginInfoRepository: Repository<LoginInfoEntity>;

  @InitRepository(ResetPasswordRequestEntity)
  resetPasswordRepository: Repository<ResetPasswordRequestEntity>;

  @InitRepository(InvitedUsersEntity)
  inviteMemberRepository: Repository<InvitedUsersEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public signup: any = async (req: TRequest<SignupDto>, res: TResponse) => {
    try {
      req.dto.password = await Bcrypt.hash(req.dto.password);
      const { firstName, lastName, email, password} = req.dto;
      const user = await this.adminuserRepository.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        return res.status(400).json({ error: l10n.t("EMAIL_ALREADY_USED") });
      }

      //   req.dto.role = EUserType.Super_Admin;
      req.dto.ip = req.ip || "";
      console.log({role: req.dto.role})
      let role;
      if(!req.dto.role) {
        role = EUserType.SuperAdmin
      } else {
        role = EUserType.Member
      }
      const partialEntity: DeepPartial<SuperadminUserEntity> = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: role,
        ip: req.dto.ip
      }
      
      const sauser: any = await this.adminuserRepository.create(partialEntity);
      await this.adminuserRepository.save(sauser);
      const token = JwtHelper.encode({ id: sauser.id });

      const agent = req.headers["user-agent"];
      const systemInfo = {
        os: {
          platform: os.platform(),
          release: os.release(),
        },
        userAgent: agent?.toString(),
      };


      const loginInfo = {
        token: token,
        userId: sauser.id,
        userType: sauser.role,
        systemId: systemInfo.os.platform,
        ip: req.ip,
      };

      const log = this.loginInfoRepository.create(loginInfo);
      await this.loginInfoRepository.save(log);
      return res.status(200).json({ msg: l10n.t("USER_CREATED"), token });
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public login: any = async (req: TRequest<LoginDto>, res: TResponse) => {
    try {
      const { email, password } = req.dto;
        console.log({email, password})
      const user = await this.adminuserRepository.findOne({
        where: { email },
        select: ["email", "id", "firstName", "lastName", "password", "status", "role"],
      });

      if (!user) {
        return res.status(404).json({ error: l10n.t("INVALID_EMAIL") });
      }

      if (user.status === ESStatus.Admin_Deactivated) {
        return res.status(400).json({ error: l10n.t("ADMIN_DEACTIVATED") });
      }

      const compare = await Bcrypt.verify(password, user.password);

      if (!compare) {
        return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
      }

      const token = JwtHelper.encode({ id: user.id });

      await this.loginInfoRepository.update(
        { userId: user.id },
        { status: false }
      );
      const userWithoutPassword: any = { ...user };
      delete userWithoutPassword.password;

      const agent = req.headers["user-agent"];
      const systemInfo = {
        os: {
          platform: os.platform(),
          release: os.release(),
        },
        userAgent: agent?.toString(),
      };

      console.log({role: user})

      const loginInfo = {
        token: token,
        userId: user.id,
        userType: user.role,
        systemId: systemInfo.os.platform,
        ip: req.ip,
      };

      const log = this.loginInfoRepository.create(loginInfo);
      await this.loginInfoRepository.save(log);

      return res.status(200).json({ token, data: userWithoutPassword });
    } catch (error) {
        console.log({error})
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public changeEmail: any = async (req: TRequest, res: TResponse) => {
    try {
        const { password, newemail } = req.dto;
        const userId: any = req.me as unknown;
        const user = await this.adminuserRepository.findOne({
          where: {
            id: userId,
          },
        });
  
        const compareO: any = await Bcrypt.verify(password, user!.password);
  
        if (!compareO) {
          return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
        }
  
        const uemail = await this.adminuserRepository.findOne({
          where: {
            email: newemail,
          },
        });
  
        if (!user) {
          return res.status(404).json({ error: l10n.t("ERR_UNAUTH") });
        }
  
        // if (user.email != oldemail) {
        //   return res.status(400).json({ error: l10n.t("OLD_EMAIL_INVALID") });
        // }
  
        if (user.email === newemail) {
          return res.status(400).json({ error: l10n.t("NEW_EMAIL_ERROR") });
        }
  
        if (uemail) {
          return res.status(400).json({ error: l10n.t("EMAIL_ALREADY_USED") });
        }
  
        await this.adminuserRepository.update(user.id, {
          email: newemail,
          emailVerificationStatus: EEmailVerificationStatus.Unverified,
          updatedAt: new Date(),
          ip: req.ip,
        });

        const emailData = {
            subject: "Email Verification",
            link: `https://localhost:4000/verify/${user.id}`,
            email: newemail
        }
        
        await Notification.sendEmailVerificationEmail(emailData)
        return res.status(200).json({ message: l10n.t("EMAIL_UPDATE_SUCCESS") });
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public changePassword: any = async (req: TRequest<UpdatePasswordDto>, res: TResponse) => {
    try {
        const { oldpassword, newpassword } = req.dto;
        const userId: any = req.me as unknown;
        const user = await this.adminuserRepository.findOne({
          where: {
            id: userId,
          },
        });
  
        const compareO: any = await Bcrypt.verify(oldpassword, user!.password);
  
        if (!compareO) {
          return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
        }
  
        const newPassword = await Bcrypt.hash(newpassword);
        const compareN: any = await Bcrypt.verify(newpassword, user!.password);
  
        if (compareO === compareN) {
          return res
            .status(400)
            .json({ error: "Old and New Password cannot be same." });
        }
  
        await this.adminuserRepository.update(user!.id, {
          password: newPassword,
          updatedAt: new Date(),
          ip: req.ip,
        });
  
        return res
          .status(200)
          .json({ message: l10n.t("PASSWORD_UPDATE") });
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public forgotPassword: any = async (req: TRequest<ForgotPasswordDto>, res: TResponse) => {
    try {
        const { email } = req.dto;

      const user = await this.adminuserRepository.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(404).json({ error: l10n.t("INVALID_EMAIL") });
      }

      let userType = user.role;
      const resetPasswordRequest = await this.resetPasswordRepository.create({
        id: uuidv4(),
        userId: user.id,
        userType: userType,
      });

      await this.resetPasswordRepository.save(resetPasswordRequest);

      Notification.sendForgotPasswordEmailToUser({
        subject: "Reset Password",
        email: email,
        name: user.firstName + " " + user.lastName,
        link: `${env.startup_domain}/reset-password/${resetPasswordRequest.id}`,
      }).then(() => {
        res.status(200).json({ message: l10n.t("RESET_PASSWORD_LINK") });
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public resetPasswordwithToken: any = async (
    req: TRequest,
    res: TResponse
  ) => {
    try {
      const { password } = req.dto as ResetPasswordDto;
      const { token } = req.params;

      const resetPassExpiryDate = moment()
        .subtract(Constants.RESET_PASS_EXPIRY, "seconds")
        .toDate();

      const resetPasswordRequest = await this.resetPasswordRepository.findOne({
        where: {
          id: token,
          createdAt: MoreThanOrEqual(resetPassExpiryDate),
        },
        order: {
          createdAt: "DESC",
        },
      });

      if (resetPasswordRequest?.status === false) {
        return res
          .status(400)
          .json({ error: l10n.t("PASSWORD_ALREADY_CHANGED.") });
      }

      if (resetPasswordRequest) {
        const hashPassword = await Bcrypt.hash(password);
        await this.adminuserRepository.update(resetPasswordRequest.userId, {
          password: hashPassword,
          updatedAt: new Date(),
          ip: req.ip,
        });
        // await this.resetPasswordRepository.update(token, {status: false});
        await this.resetPasswordRepository.delete(token);
      } else {
        return res
          .status(400)
          .json({ error: "Request invalid or expired, please try again!" });
      }

      return res.status(200).json({ msg: l10n.t("PASSWORD_UPDATE") });
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public inviteMembers: any = async (req: TRequest<InviteUserDto>, res: TResponse) => {
    try {
      const { email, role } = req.dto;

      const validEmail = await this.adminuserRepository.findOne({
        where: {
          email: email
        }
      });

      if(validEmail) {
        return res.status(400).json({error: "Email already registered."})
      }

      const isInvited = await this.inviteMemberRepository.findOne({
        where: {
          email: email
        }
      })

      if(isInvited) {
        return res.status(400).json({error: "User already invited. Please resend the invitation again to invite."})
      }

      const userId: any = req.me as unknown;
      const invitation: DeepPartial<InvitedUsersEntity> = {
        invitedBy: userId,
        email: email,
        role: role,
        status: EInvitedMemberStatus.Pending
      }
      
      console.log({invitation});

      const invite = await this.inviteMemberRepository.create(invitation);
      await this.inviteMemberRepository.save(invite);


      const emailData = {
        subject: "Invitation to signup in admin portal",
        email: email,
        link: `${env.startup_domain}/invitation/signup/${invite.id}`      
      }
      await Notification.sendInvitationEmail(emailData)

      return res.status(200).json({message: "Invitation sent."})
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public resendInvitation: any = async (req: TRequest<ResendInviteDto>, res: TResponse) => {
    try {
      const { email } = req.dto;
      const isValidEmail = await this.inviteMemberRepository.findOne({
        where: {
          email: email
        }
      });

      if(!isValidEmail) {
        return res.status(400).json({error: "Please invite member first before sending the invitation again."})
      }

      if(isValidEmail.status === EInvitedMemberStatus.Accepted) {
        return res.status(400).json({error: "User had already accepted the invitation."})
      }

      const emailData = {
        subject: "Invitation to signup in admin portal",
        email: email,
        link: `${env.startup_domain}/invitation/signup/${isValidEmail.id}`      
      }
      await Notification.sendInvitationEmail(emailData);
      return res.status(200).json({message: "Invitation sent."})
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public inviteSignup: any = async (req: TRequest<InviteSignupDto>, res: TResponse) => {
    try {
      const id: any = req.params.id;
      req.dto.password = await Bcrypt.hash(req.dto.password);
      const { firstName, lastName, email, password} = req.dto;

      const isValidId: any = await this.inviteMemberRepository.findOne({
        where: {
          id: id
        }
      })

      console.log({isValidId: isValidId.role})

      if(!isValidId) {
        return res.status(400).json({error: "Invalid Id. No invited user found"})
      }
      const user = await this.adminuserRepository.findOne({
        where: {
          email: isValidId.email,
        },
      });

      if (user) {
        return res.status(400).json({ error: l10n.t("EMAIL_ALREADY_USED") });
      }

      //   req.dto.role = EUserType.Super_Admin;
      req.dto.ip = req.ip || "";
      let role = isValidId.role;

      const partialEntity: DeepPartial<SuperadminUserEntity> = {
        firstName: firstName,
        lastName: lastName,
        email: isValidId.email,
        password: password,
        role: role,
        emailVerificationStatus: EEmailVerificationStatus.Verified,
        ip: req.dto.ip
      }
      
      const sauser: any = await this.adminuserRepository.create(partialEntity);
      await this.adminuserRepository.save(sauser);
      const token = JwtHelper.encode({ id: sauser.id });


      isValidId.status = EInvitedMemberStatus.Accepted;
      await this.inviteMemberRepository.save(isValidId);

      const agent = req.headers["user-agent"];
      const systemInfo = {
        os: {
          platform: os.platform(),
          release: os.release(),
        },
        userAgent: agent?.toString(),
      };


      const loginInfo = {
        token: token,
        userId: sauser.id,
        userType: sauser.role,
        systemId: systemInfo.os.platform,
        ip: req.ip,
      };

      const log = this.loginInfoRepository.create(loginInfo);
      await this.loginInfoRepository.save(log);
      return res.status(200).json({ msg: l10n.t("USER_CREATED"), token });    
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public verifyEmail: any = async (req: TRequest, res: TResponse) => {
    try {
      const id: any = req.params.id;
      const user = await this.adminuserRepository.findOne({
        where: {
          id: id
        }
      })

      if(!user) {
        return res.status(400).json({error: "Something went wrong. Email verification unsuccessful. User not found"})
      }

      if(user.emailVerificationStatus == EEmailVerificationStatus.Verified) {
        return res.status(400).json({error: "Email Already Verified."})
      }

      user.emailVerificationStatus = EEmailVerificationStatus.Verified;

      await this.adminuserRepository.save(user);
      return res.status(200).json({message: "Email verification successful."})
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public removeMember: any = async (req: TRequest, res: TResponse) => {
    try {
      const id: any = req.params.id;
      const user = await this.adminuserRepository.findOne({
        where: {
          id: id
        }
      })

      if(!user) {
        return res.status(400).json({error: 'User not found.'})
      }

      if(user.status == ESStatus.Admin_Deactivated) {
        return res.status(400).json({error: `${user.email} is already deactivated.`})
      }

      user.status = ESStatus.Admin_Deactivated;
      await this.adminuserRepository.save(user);

      return res.status(200).json({message: `Member with email: ${user.email} is deactivated as per your request.`})
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };

  public getUserslist: any = async (req: TRequest, res: TResponse) => {
    try {
      const users = await this.adminuserRepository.find();
      const inviteduser = await this.inviteMemberRepository.find({
        where: {
          status: EInvitedMemberStatus.Pending
        }
      });

      const userProperties = users.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        status: u.status
      }))

      const inviteduserProperties: any = inviteduser.map(u => ({
        firstName: null,
        lastName: null,
        email: u.email,
        status: u.status
      }))

      const list = userProperties.concat(inviteduserProperties);
      // console.log(users)
      // console.log(inviteduser)

      return res.status(200).json({users: list})
    } catch (error) {
      return res.status(500).json({ error: l10n.t("ERR_INTERNAL_SERVER") });
    }
  };
}
