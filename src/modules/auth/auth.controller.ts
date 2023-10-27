import { MoreThanOrEqual, Repository } from "typeorm";
import moment from "moment";
import * as l10n from "jm-ez-l10n";
import { v4 as uuidv4 } from "uuid";
import { ELogsActivity, ERolesRole, TRequest, TResponse } from "@types";
import { LogEntity, ParticipateEntity, ResetPasswordRequestEntity, TwoFactorAuthRequestEntity, UserEntity, SettingEntity, RolesEntity, UserRolesEntity } from "@entities";
import { InitRepository, InjectRepositories, Bcrypt, JwtHelper, GenerateOTP, Notification, PhoneNumberValidator } from "@helpers";
import { Constants, env } from "@configs";
import { CreateUserDto, ForgotPasswordDto, ResetPasswordDto, SendTwoFactorDto, SignInDto, VerifyTwoFactorDto } from "./dto";

export class AuthController {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(ResetPasswordRequestEntity)
  resetPasswordRequest: Repository<ResetPasswordRequestEntity>;

  @InitRepository(TwoFactorAuthRequestEntity)
  twoFactorAuthRequestEntity: Repository<TwoFactorAuthRequestEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(LogEntity)
  logRepository: Repository<LogEntity>;

  @InitRepository(SettingEntity)
  settingRepository: Repository<SettingEntity>;

  @InitRepository(RolesEntity)
  rolesRepository: Repository<RolesEntity>;

  @InitRepository(UserRolesEntity)
  userRolesRepository: Repository<UserRolesEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateUserDto>, res: TResponse) => {
    req.dto.password = await Bcrypt.hash(req.dto.password);

    const userDetail = await this.userRepository.findOne({
      where: {
        email: req.dto.email,
      },
    });

    if (userDetail) {
      return res.status(400).json({ error: l10n.t("USER_ALREADY_EXIST") });
    }

    const user = await this.userRepository.create(req.dto);
    await this.userRepository.save(user);
    const token = JwtHelper.encode({ id: user.id });

    const roles = await this.rolesRepository.findOne({
      where: { role: ERolesRole.Super_Admin },
    });

    const userRole = await this.userRolesRepository.create({
      userId: user.id,
      roleId: roles.id,
    });
    await this.userRolesRepository.save(userRole);

    const participate = await this.participateRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (participate) {
      await this.participateRepository.update(participate.id, {
        userId: user.id,
        isInvited: false,
      });

      await this.userRolesRepository.update(
        { participateId: participate.id },
        {
          userId: user.id,
        },
      );
    }

    return res.status(200).json({ msg: l10n.t("USER_CREATED"), token });
  };

  public signIn = async (req: TRequest<SignInDto>, res: TResponse) => {
    const { email, password } = req.dto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ["email", "id", "firstName", "lastName", "isAdmin", "password", "isActive"],
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials!!" });
    }

    if (!user.isActive) {
      return res.status(400).json({ error: "User is not active" });
    }

    const compare = await Bcrypt.verify(password, user.password);

    if (!compare) {
      return res.status(400).json({ error: "Invalid Credentials!!" });
    }

    const token = JwtHelper.encode({ id: user.id });

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    const logDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    const log = await this.logRepository.create({
      metadata: logDetails,
      activity: ELogsActivity.Login_History,
      userId: user.id,
    });
    await this.logRepository.save(log);

    const setting = await this.settingRepository.create({
      userId: user.id,
      isQANotification: false,
      isTeamSpecificQA: false,
    });
    await this.settingRepository.save(setting);

    return res.status(200).json({ token, data: userWithoutPassword });
  };

  public forgotPassword = async (req: TRequest<ForgotPasswordDto>, res: TResponse) => {
    const { email } = req.dto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "isActive", "firstName", "lastName"],
    });

    if (!user) {
      return res.status(400).json({ error: "User not found, Please verify email account!" });
    }

    const resetPasswordRequest = await this.resetPasswordRequest.create({ id: uuidv4(), userId: user.id });
    await this.resetPasswordRequest.save(resetPasswordRequest);

    const emailData = {
      link: `${env.domain}/reset-password/${resetPasswordRequest.id}`,
    };
    try {
      await Notification.email("reset-password", emailData, [user.email]);

      return res.status(200).json({ msg: l10n.t("RESET_PASSWORD_LINK") });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  };

  public resetPassword = async (req: TRequest<ResetPasswordDto>, res: TResponse) => {
    const { password } = req.dto as ResetPasswordDto;
    const { token } = req.params;

    const resetPassExpiryDate = moment().subtract(Constants.RESET_PASS_EXPIRY, "seconds").toDate();

    const resetPasswordRequest = await this.resetPasswordRequest.findOne({
      where: {
        id: token,
        createdAt: MoreThanOrEqual(resetPassExpiryDate),
      },
      order: {
        createdAt: "DESC",
      },
    });

    if (resetPasswordRequest) {
      const hashPassword = await Bcrypt.hash(password);
      await this.userRepository.update(resetPasswordRequest.userId, { password: hashPassword });
      await this.resetPasswordRequest.delete(token);
    } else {
      return res.status(400).json({ error: "Request invalid or expired, please try again!" });
    }

    return res.status(200).json({ msg: l10n.t("PASSWORD_UPDATE") });
  };

  public sendTwoFactor = async (req: TRequest<SendTwoFactorDto>, res: TResponse) => {
    const { mobile } = req.dto;
    if (!PhoneNumberValidator.validate(mobile)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    await this.userRepository.update(req.me.id, { mobile });

    const otp = GenerateOTP.generate();
    const hashOTP = await Bcrypt.hash(otp.toString());

    const twoFactorAuth = await this.twoFactorAuthRequestEntity.create({ id: uuidv4(), userId: req.me.id, hashCode: hashOTP });
    await this.twoFactorAuthRequestEntity.save(twoFactorAuth);

    const message = `Use this OTP: ${otp} for 2FA authentication. Keep it secret and don't share it with anyone.`;
    try {
      await Notification.sms(message, mobile.trim());

      return res.status(200).json({ msg: l10n.t("2FA_SENT") });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  };

  public verifyTwoFactor = async (req: TRequest<VerifyTwoFactorDto>, res: TResponse) => {
    const { code } = req.dto;
    const otpExpiryDate = moment().subtract(Constants.OTP_EXPIRY, "seconds").toDate();

    const userHashOtp = await this.twoFactorAuthRequestEntity.findOne({
      where: {
        userId: req.me.id,
        createdAt: MoreThanOrEqual(otpExpiryDate),
      },
      order: {
        createdAt: "DESC",
      },
      select: ["hashCode"],
    });

    if (!userHashOtp) {
      return res.status(400).json({ error: "OTP has expired, please try again!" });
    }

    const codeStr = code.toString();
    const compare = await Bcrypt.verify(codeStr, userHashOtp.hashCode);

    if (compare) {
      await this.userRepository.update(req.me.id, { is2FAEnabled: true });
      await this.twoFactorAuthRequestEntity.delete({ userId: req.me.id });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    return res.status(200).json({ msg: l10n.t("2FA_VERIFY") });
  };

  public getRoles = async (req: TRequest, res: TResponse) => {
    const roles = await this.rolesRepository.find({
      select: ["id", "role", "permission"],
    });
    return res.status(200).json({ roles });
  };
}
