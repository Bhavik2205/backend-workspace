import { FolderEntity } from "@entities";
import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest } from "@types";
import { Repository } from "typeorm";
import { InitRepository, InjectRepositories } from "@helpers";
import { CreateFolderDto, UpdateFolderDto } from "./dto";

export class FolderController {
  @InitRepository(FolderEntity)
  folderRepository: Repository<FolderEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateFolderDto>, res: TResponse) => {
    const { name, parentId } = req.dto;
    const { workspaceid: workspaceId } = req.headers;
  
    let folder: FolderEntity;
  
    if (parentId) {
      // If parentId is provided, create a subfolder
      const parentFolder = await this.folderRepository.findOne({
        where: {
          id: parentId
        }
      });
      if (!parentFolder) {
        return res.status(404).json({ msg: "Parent folder not found." });
      }
  
      folder = await this.folderRepository.create({
        name,
        workspaceId,
        parentId: parentFolder.id,
      });
    } else {
      // If parentId is not provided, create a top-level folder
      folder = await this.folderRepository.create({
        name,
        workspaceId,
      });
    }
  
    await this.folderRepository.save(folder);
    res.status(200).json({ msg: l10n.t("FOLDER_CREATE_SUCCESS"), data: folder });  
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;

    const [data] = await this.folderRepository.findAndCount({
      where: {
        workspaceId,
      },
    });

    res.status(200).json({
      data,
    });
  };

  public update = async (req: TRequest<UpdateFolderDto>, res: TResponse) => {
    const { name } = req.dto;
    const { folderId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    try {
      await this.folderRepository.update(folderId, {
        name,
      });

      const folder = await this.folderRepository.findOne({
        where: {
          id: +folderId,
          workspaceId,
        },
      });

      res.status(200).json({ msg: l10n.t("FOLDER_UPDATE_SUCCESS"), data: folder });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { folderId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const folder = await this.folderRepository.findOne({
        where: {
          id: +folderId,
          workspaceId,
        },
      });

      await this.folderRepository.remove(folder);

      res.status(200).json({ msg: l10n.t("FOLDER_DELETE_SUCCESS") });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
