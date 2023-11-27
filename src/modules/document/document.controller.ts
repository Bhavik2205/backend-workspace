import { DocumentEntity, FolderEntity, LogEntity, UserEntity } from "@entities";
import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest, EAzureFolder, ELogsActivity } from "@types";
import { Repository } from "typeorm";
import { AzureUtils, InitRepository, InjectRepositories, Utils } from "@helpers";
import { env } from "@configs";
import moment from "moment";
import { CreateDocumentDto, UpdateDocumentDto } from "./dto";

export class DocumentController {
  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;

  @InitRepository(FolderEntity)
  folderRepository: Repository<FolderEntity>;

  @InitRepository(LogEntity)
  logRepository: Repository<LogEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateDocumentDto>, res: TResponse) => {
    const { categoryId, folderId, isEditable, isDownloadable } = req.dto;
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;
    const file = Array.isArray(req.files.file) ? req.files.file : [req.files.file];

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
    });

    const documentCount = await this.documentRepository.find({
      where: {
        workspaceId,
      },
    });

    const promises = file.map(async (e: any) => {
      const totalSize = documentCount.reduce((acc, document) => acc + Number(document.size), 0);
      const size = totalSize + e.size;

      const maxDocSizeByPlanId: {
        [key: number]: number;
      } = {
        1: 10737418240,
        2: 5368709120,
        3: 104857600,
      };

      const hasReachedMaxDocSize = user && size > maxDocSizeByPlanId[user.planId];

      if (hasReachedMaxDocSize) {
        res.status(400).json({ error: "Maximum storage space reached for this workspace" });
        return;
      }

      AzureUtils.initialize();

      const blobName = `${EAzureFolder.Workspace}/${workspaceId}/${moment().format("YYYYMMDDHHmmssSSS")}`;
      const containerClient = AzureUtils.getContainerClient(env.containerName);
      const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
      await blockBlobClient.uploadData(e.data, e.size);
      const blobUrl = `${env.containerName}/${blobName}`;

      const updatedDocument = await this.documentRepository.create({
        categoryId,
        folderId,
        file: blobUrl,
        name: e.name,
        size: e.size,
        isEditable,
        isDownloadable,
        userId: me.id,
        workspaceId,
      });

      const document = await this.documentRepository.save(updatedDocument);

      const documentNumber = Utils.generateRandomNumber(document.userId, workspaceId, document.id);
      document.docNum = parseInt(documentNumber, 10);

      const documentDetail = {
        file: updatedDocument.file,
        size: updatedDocument.size,
        workspaceId: updatedDocument.workspaceId,
        fileName: updatedDocument.name,
        categoryId: updatedDocument.categoryId,
        folderId: updatedDocument.folderId,
      };

      const log = await this.logRepository.create({
        metadata: documentDetail,
        workspaceId,
        activity: ELogsActivity.Document_Upload,
        userId: me.id,
      });
      await this.logRepository.save(log);

      await this.documentRepository.save(document);
    });
    await Promise.all(promises);
    return res.status(200).json({ msg: l10n.t("DOCUMENT_UPLOAD_SUCCESS") });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;

    const documents = await this.folderRepository
      .createQueryBuilder("folder")
      .leftJoinAndSelect("folder.document", "document")
      .leftJoinAndSelect("document.category", "category")
      .leftJoinAndSelect("document.user", "user")
      .leftJoinAndSelect("document.question", "question")
      .leftJoinAndSelect("user.participates", "participates")
      .leftJoinAndSelect("participates.teams", "teams")
      .select([
        "folder.id",
        "folder.name",
        "document.id",
        "document.name",
        "document.docNum",
        "document.file",
        "document.categoryId",
        "document.createdAt",
        "document.updatedAt",
        "category.name",
        "user.firstName",
        "user.lastName",
        "question.id",
        "participates.teamId",
        "teams.name",
        "document.size",
        "document.isEditable",
        "document.isDownloadable",
      ])
      .where({ workspaceId })
      .getMany();

    documents.forEach(folder => {
      let folderSize: bigint = BigInt(0);

      folder.document.forEach(e => {
        e.file = `${env.azureURL}${e.file}`;
        folderSize += BigInt(e.size);
      });

      Object.assign(folder, { totalSize: Number(folderSize) });
    });

    res.status(200).json({ data: documents });
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { documentId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const document = await this.documentRepository.findOne({
        where: {
          id: +documentId,
          workspaceId,
        },
      });

      await this.documentRepository.remove(document);

      res.status(200).json({ msg: l10n.t("DOCUMENT_DELETE_SUCCESS") });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public search = async (req: TRequest, res: TResponse) => {
    const { query } = req.query;
    const { workspaceid: workspaceId } = req.headers;

    const documents = await this.folderRepository
      .createQueryBuilder("folder")
      .leftJoinAndSelect("folder.document", "document")
      .leftJoinAndSelect("document.category", "category")
      .leftJoinAndSelect("document.user", "user")
      .leftJoinAndSelect("document.question", "question")
      .leftJoinAndSelect("user.participates", "participates")
      .leftJoinAndSelect("participates.teams", "teams")
      .select([
        "folder.id",
        "folder.name",
        "document.id",
        "document.name",
        "document.docNum",
        "document.file",
        "document.categoryId",
        "document.createdAt",
        "document.updatedAt",
        "category.name",
        "user.firstName",
        "user.lastName",
        "question.id",
        "participates.teamId",
        "teams.name",
      ])
      .where("document.name LIKE :query", { query: `%${query}%` })
      .andWhere("document.workspaceId = :workspaceId", { workspaceId })
      .getMany();

    documents.forEach(folder => {
      folder.document.forEach(e => {
        e.file = `${env.azureURL}${e.file}`;
      });
    });

    res.status(200).json({ data: documents });
  };

  public edit = async (req: TRequest<UpdateDocumentDto>, res: TResponse) => {
    const { categoryId, folderId } = req.dto;
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;
    const file = req?.files?.file;
    const { documentId } = req.params;

    const user = await this.userRepository.findOne({
      where: {
        id: me.id,
      },
    });

    const documentData = await this.documentRepository.findOne({
      where: {
        id: +documentId,
        workspaceId,
      },
    });

    if (documentData.isEditable === true) {
      const documentCount = await this.documentRepository.find({
        where: {
          workspaceId,
        },
      });

      const totalSize = documentCount.reduce((acc, document) => acc + Number(document.size), 0);

      let size;
      if (file) {
        const remainingSize = totalSize - documentData.size;
        size = remainingSize + file.size;

        const maxDocSizeByPlanId: {
          [key: number]: number;
        } = {
          1: 10737418240,
          2: 5368709120,
          3: 104857600,
        };

        const hasReachedMaxDocSize = user && size > maxDocSizeByPlanId[user.planId];

        if (hasReachedMaxDocSize) {
          return res.status(400).json({ error: "Maximum storage space reached for this workspace" });
        }

        AzureUtils.initialize();

        const blobName = `${EAzureFolder.Workspace}/${workspaceId}/${moment().format("YYYYMMDDHHmmss")}`;
        const containerClient = AzureUtils.getContainerClient(env.containerName);
        const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
        await blockBlobClient.uploadData(file?.data, file?.size);

        const blobUrl = `${env.containerName}/${blobName}`;

        await this.documentRepository.update(
          { id: documentData.id },
          {
            categoryId,
            folderId,
            file: blobUrl,
            name: file?.name,
            size: file?.size,
          },
        );

        const documentDetail = {
          file: blobUrl,
          size,
          workspaceId,
          fileName: file?.name,
          categoryId,
          folderId,
        };

        const log = await this.logRepository.create({
          metadata: documentDetail,
          workspaceId,
          activity: ELogsActivity.Document_Upload,
          userId: me.id,
        });
        await this.logRepository.save(log);
      } else {
        await this.documentRepository.update(
          { id: documentData.id },
          {
            categoryId,
            folderId,
          },
        );

        const documentDetail = {
          file: documentData.file,
          size: documentData.size,
          workspaceId,
          fileName: documentData.name,
          categoryId,
          folderId,
        };

        const log = await this.logRepository.create({
          metadata: documentDetail,
          workspaceId,
          activity: ELogsActivity.Document_Upload,
          userId: me.id,
        });
        await this.logRepository.save(log);
      }
      res.status(200).json({ msg: l10n.t("DOCUMENT_UPDATE_SUCCESS") });
    } else {
      res.status(400).json({ msg: l10n.t("ERR_PERMISSION_DENIED") });
    }
    return res.status(200);
  };
}
