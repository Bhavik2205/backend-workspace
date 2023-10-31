import { TeamEntity, UserEntity, WorkspaceEntity } from "@entities";
import { AzureUtils, Bcrypt, InitRepository, InjectRepositories } from "@helpers";
import { EAzureFolder, TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { env } from "@configs";
import moment from "moment";
import { CreateWorkspaceDto, UpdateDescriptionDto, UpdateWorkspaceDto } from "./dto";

export class WorkspaceController {
  @InitRepository(WorkspaceEntity)
  workspaceRepository: Repository<WorkspaceEntity>;

  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateWorkspaceDto>, res: TResponse) => {
    const { name, description, purpose, type } = req.dto;
    const { me } = req;

    const workspace = await this.workspaceRepository.create({
      name,
      description,
      purpose,
      type,
      userId: me.id,
    });

    await this.workspaceRepository.save(workspace);

    const internalTeam = await this.teamRepository.create({
      name: "Internal Team",
      workspaceId: workspace.id,
    });

    const externalTeam = await this.teamRepository.create({
      name: "External Team",
      workspaceId: workspace.id,
    });

    await this.teamRepository.save([internalTeam, externalTeam]);

    res.status(200).json({ msg: l10n.t("WORKSPACE_CREATE_SUCCESS"), data: workspace });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { page, limit } = req.pager;
    const { me } = req;

    const [data, count] = await this.workspaceRepository.findAndCount({
      where: {
        userId: me.id,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    res.status(200).json({
      data,
      count,
      limit,
    });
  };

  public readOne = async (req: TRequest, res: TResponse) => {
    const { workspaceId } = req.params;

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: +workspaceId,
      },
    });

    if (workspace && workspace.imageUrl) {
      workspace.imageUrl = `${env.azureURL}${workspace.imageUrl}`;
    }

    res.status(200).json({ data: workspace });
  };

  public update = async (req: TRequest<UpdateWorkspaceDto>, res: TResponse) => {
    const { presentPassword, name } = req.dto;
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
      select: ["id", "firstName", "lastName", "password"],
    });

    const compare = await Bcrypt.verify(presentPassword, user.password);

    if (!compare) {
      return res.status(400).json({ error: "Invalid Credentials!!" });
    }

    await this.workspaceRepository.update(workspaceId, {
      name,
    });

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: +workspaceId,
      },
      select: ["id", "name"],
    });

    return res.status(200).json({ msg: l10n.t("WORKSPACE_UPDATE_SUCCESS"), data: workspace });
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { workspaceId } = req.params;

    await this.workspaceRepository.delete(workspaceId);

    res.status(200).json({ msg: l10n.t("WORKSPACE_DELETE_SUCCESS") });
  };

  public updateDescriptoin = async (req: TRequest<UpdateDescriptionDto>, res: TResponse) => {
    const { description } = req.dto;
    const { workspaceid: workspaceId } = req.headers;

    await this.workspaceRepository.update(workspaceId, {
      description,
    });

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: +workspaceId,
      },
      select: ["description"],
    });

    res.status(200).json({ msg: l10n.t("DESCRIPTION_UPDATE_SUCCESS"), data: workspace });
  };

  public updateImage = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;
    const { file } = req.files;

    AzureUtils.initialize();

    const blobName = `${EAzureFolder.Workspace}/images/${moment().format("YYYYMMDDHHmmss")}`;
    const containerClient = AzureUtils.getContainerClient(env.containerName);
    const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
    await blockBlobClient.uploadData(file.data, file.size);

    const blobUrl = `${env.containerName}/${blobName}`;

    await this.workspaceRepository.update(workspaceId, {
      imageUrl: blobUrl,
    });

    const image = `${env.azureURL}${blobUrl}`

    return res.status(200).json({ data: image});
  };

  public workspaceSetting = async (req: TRequest, res: TResponse) => {
    const { workspaceId } = req.params;
    const data = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.user", "user")
      .leftJoinAndSelect("user.setting", "setting")
      .select([
        "workspace.id",
        "workspace.name",
        "workspace.imageUrl",
        "workspace.description",
        "workspace.purpose",
        "workspace.type",
        "user.email",
        "user.mobile",
        "setting.isQANotification",
        "setting.isTeamSpecificQA",
      ])
      .where("workspace.id = :workspaceId", { workspaceId })
      .getMany();

    res.status(200).json({
      data,
    });
  };
}
