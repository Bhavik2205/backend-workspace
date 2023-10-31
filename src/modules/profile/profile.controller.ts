import { UserEntity } from "@entities";
import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest, EAzureFolder } from "@types";
import { Repository } from "typeorm";
import { AzureUtils, Bcrypt, InitRepository, InjectRepositories } from "@helpers";
import { env } from "@configs";
import moment from "moment";
import { UpdateEmailDto, UpdateNameDto, UpdateMobileDto, UpdateCompanyDto, UpdatePasswordDto } from "./dto";

export class ProfileController {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public read = async (req: TRequest, res: TResponse) => {
    const { me } = req;

    const data = await this.userRepository.findOne({
      select: ["id", "firstName", "lastName", "email", "mobile", "password", "imageUrl", "companyName", "is2FAEnabled"],
      where: {
        id: me.id,
      },
    });

    if (data && data.imageUrl) {
      data.imageUrl = `${env.azureURL}${data.imageUrl}`;
    }

    res.status(200).json({
      data,
    });
  };

  public updateEmail = async (req: TRequest<UpdateEmailDto>, res: TResponse) => {
    const { presentPassword, email } = req.dto;
    const { me } = req;

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
      select: ["id", "firstName", "lastName", "password"],
    });

    const compare = await Bcrypt.verify(presentPassword, user.password);

    if (!compare) {
      return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
    }

    await this.userRepository.update(me.id, {
      email,
    });

    const data = await this.userRepository.findOne({
      where: {
        id: +me.id,
      },
      select: ["id", "email"],
    });

    return res.status(200).json({ msg: l10n.t("EMAIL_UPDATE_SUCCESS"), data });
  };

  public updateName = async (req: TRequest<UpdateNameDto>, res: TResponse) => {
    const { firstName, lastName } = req.dto;
    const { me } = req;

    await this.userRepository.update(me.id, {
      firstName,
      lastName,
    });

    const user = await this.userRepository.findOne({
      where: {
        id: +me.id,
      },
      select: ["id", "firstName", "lastName"],
    });

    res.status(200).json({ msg: l10n.t("NAME_UPDATE_SUCCESS"), data: user });
  };

  public updateMobile = async (req: TRequest<UpdateMobileDto>, res: TResponse) => {
    const { presentPassword, mobile } = req.dto;
    const { me } = req;

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
      select: ["id", "firstName", "lastName", "password"],
    });

    const compare = await Bcrypt.verify(presentPassword, user.password);

    if (!compare) {
      return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
    }

    await this.userRepository.update(me.id, {
      mobile,
    });

    const data = await this.userRepository.findOne({
      where: {
        id: +me.id,
      },
      select: ["id", "mobile"],
    });

    return res.status(200).json({ msg: l10n.t("MOBILE_UPDATE_SUCCESS"), data });
  };

  public updateCompanyName = async (req: TRequest<UpdateCompanyDto>, res: TResponse) => {
    const { presentPassword, companyName } = req.dto;
    const { me } = req;

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
      select: ["id", "firstName", "lastName", "password"],
    });

    const compare = await Bcrypt.verify(presentPassword, user.password);

    if (!compare) {
      return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
    }

    await this.userRepository.update(me.id, {
      companyName,
    });

    const data = await this.userRepository.findOne({
      where: {
        id: +me.id,
      },
      select: ["id", "companyName"],
    });

    return res.status(200).json({ msg: l10n.t("COMPANY_NAME_UPDATE_SUCCESS"), data });
  };

  public updatePassword = async (req: TRequest<UpdatePasswordDto>, res: TResponse) => {
    const { presentPassword, newPassword } = req.dto;
    const { me } = req;

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
      select: ["id", "firstName", "lastName", "password"],
    });

    const compare = await Bcrypt.verify(presentPassword, user.password);

    if (!compare) {
      return res.status(400).json({ error: l10n.t("INVALID_PASSWORD") });
    }

    const hashpassword = await Bcrypt.hash(newPassword);
    await this.userRepository.update(me.id, {
      password: hashpassword,
    });

    return res.sendStatus(200);
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { me } = req;

    await this.userRepository.delete(me.id);

    res.status(200).json({ msg: l10n.t("ACCOUNT_DELETE_SUCCESS") });
  };

  public uploadImage = async (req: TRequest, res: TResponse) => {
    const { me } = req;
    const { file } = req.files;

    AzureUtils.initialize();

    const blobName = `${EAzureFolder.User}/${moment().format("YYYYMMDDHHmmss")}`;
    const containerClient = AzureUtils.getContainerClient(env.containerName);
    const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
    await blockBlobClient.uploadData(file.data, file.size);

    const blobUrl = `${env.containerName}/${blobName}`;

    await this.userRepository.update(me.id, {
      imageUrl: blobUrl,
    });

    const image = `${env.azureURL}${blobUrl}`

    return res.status(200).json({ data: image});
  };

  public update2fa = async (req: TRequest, res: TResponse) => {
    const { me } = req;

    const userData = await this.userRepository.findOne({
      where: {
        id: me.id
      }
    });

    const updatedStatus = !userData.is2FAEnabled;

    await this.userRepository.update({ id: me.id }, {
      is2FAEnabled: updatedStatus,
    },
    );
    res.status(200).json({ msg: l10n.t("TWO_FACTOR_AUTHENTICATION_STATUS_UPDATED_SUCCESS") });
  };

}
