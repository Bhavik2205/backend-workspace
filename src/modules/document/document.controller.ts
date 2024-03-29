import { env } from "@configs";
import { CategoryEntity, DocumentEntity, FolderEntity, LogEntity, SubscriptionPlanEntity, UserEntity } from "@entities";
import { AzureUtils, InitRepository, InjectRepositories, Utils } from "@helpers";
import { EActivityStatus, EAzureFolder, ELogsActivity, TRequest, TResponse } from "@types";
import * as l10n from "jm-ez-l10n";
import moment from "moment";
import { Repository } from "typeorm";
import axios from "axios";
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

  @InitRepository(CategoryEntity)
  categoryRepository: Repository<CategoryEntity>;

  @InitRepository(SubscriptionPlanEntity)
  subscriptionPlanRepository: Repository<SubscriptionPlanEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateDocumentDto>, res: TResponse) => {
    const { categoryId, folderId, isEditable, isDownloadable } = req.dto;
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;
    const file = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
    const savedDocuments: any[] = [];

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
      const totalSize = documentCount.reduce((acc, document) => acc + BigInt(document.size), BigInt(0));
      const size = totalSize + BigInt(e.size);

      const planDetail = await this.subscriptionPlanRepository.findOne({
        where: {
          id: user.planId,
        },
      });

      const planData = planDetail.feature as any as { documentSize?: number }[];
      let totalDocumentSize: bigint = BigInt(planData.find(d => d?.documentSize !== undefined)?.documentSize || 0);

      const subscription = await axios.get("https://api.dev.workspace.tesseractsquare.com/subscriptions", {
        headers: {
          Authorization: req.headers.authorization,
        },
      });
      console.log(subscription);

      if (subscription?.data?.data?.plan?.slug === "additional-storage-space") {
        const additionalStoragePlan = await this.subscriptionPlanRepository.findOne({
          where: {
            id: subscription?.data?.data?.planId,
          },
        });

        const additionalStorageDetail = additionalStoragePlan.feature as any as { documentSize?: number }[];
        const additionalDocumentStorage = BigInt(additionalStorageDetail.find(c => c?.documentSize !== undefined)?.documentSize || 0);
        totalDocumentSize += additionalDocumentStorage;
      }

      const hasReachedMaxDocSize = user && size > totalDocumentSize;

      if (hasReachedMaxDocSize) {
        res.status(400).json({ error: "Maximum storage space reached for this workspace" });
        return;
      }

      AzureUtils.initialize();

      const blobName = `${EAzureFolder.Workspace}/${workspaceId}/${moment().format("YYYYMMDDHHmmssSSS")}`;
      const containerClient = AzureUtils.getContainerClient(env.containerName);
      const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
      await blockBlobClient.uploadData(e.data, {
        blobHTTPHeaders: {
          blobContentType: e.mimetype || "application/octet-stream",
        },
      });
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
        mimeType: e.mimetype,
      });

      const document = await this.documentRepository.save(updatedDocument);

      const documentNumber = Utils.generateRandomNumber(document.userId, workspaceId, document.id);
      document.docNum = parseInt(documentNumber, 10);

      const folder = await this.folderRepository.findOne({
        where: {
          workspaceId,
          id: +folderId,
        },
      });

      const category = await this.categoryRepository.findOne({
        where: {
          workspaceId,
          id: +categoryId,
        },
      });

      const documentDetail = {
        file: updatedDocument.file,
        size: updatedDocument.size,
        workspaceId: updatedDocument.workspaceId,
        fileName: updatedDocument.name,
        category: category.name,
        folder: folder.name,
        status: EActivityStatus.Document_Created,
      };

      const log = await this.logRepository.create({
        metadata: documentDetail,
        workspaceId,
        activity: ELogsActivity.Document_Upload,
        userId: me.id,
      });
      await this.logRepository.save(log);

      savedDocuments.push({
        id: document.id,
        size: document.size,
        file: document.file,
        folderId: document.folderId,
        categoryId: document.categoryId,
        userId: document.userId,
        workspaceId: document.workspaceId,
        isEditable: document.isEditable,
        isDownloadable: document.isDownloadable,
        docNum: document.docNum,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      });

      await this.documentRepository.save(document);
    });
    await Promise.all(promises);
    return res.status(200).json({ msg: l10n.t("DOCUMENT_UPLOAD_SUCCESS"), data: savedDocuments });
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
        "document.folderId",
        "document.userId",
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
    const { categoryId, folderId, isEditable, isDownloadable } = req.dto;
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

    const documentCount = await this.documentRepository.find({
      where: {
        workspaceId,
      },
    });

    const totalSize = documentCount.reduce((acc, document) => acc + BigInt(document.size), BigInt(0));

    let size;
    if (file) {
      const remainingSize = totalSize - BigInt(documentData.size);
      size = remainingSize + BigInt(file.size);

      const planDetail = await this.subscriptionPlanRepository.findOne({
        where: {
          id: user.planId,
        },
      });

      const planData = planDetail.feature as any as { documentSize?: number }[];
      let totalDocumentSize: bigint = BigInt(planData.find(e => e?.documentSize !== undefined)?.documentSize || 0);

      const subscription = await axios.get("https://api.dev.workspace.tesseractsquare.com/subscriptions", {
        headers: {
          Authorization: req.headers.authorization,
        },
      });
      console.log(subscription);

      if (subscription?.data?.data?.plan?.slug === "additional-storage-space") {
        const additionalStoragePlan = await this.subscriptionPlanRepository.findOne({
          where: {
            id: subscription?.data?.data?.planId,
          },
        });

        const additionalStorageDetail = additionalStoragePlan.feature as any as { documentSize?: number }[];
        const additionalDocumentStorage = BigInt(additionalStorageDetail.find(e => e?.documentSize !== undefined)?.documentSize || 0);
        totalDocumentSize += additionalDocumentStorage;
      }

      const hasReachedMaxDocSize = user && size > totalDocumentSize;

      if (hasReachedMaxDocSize) {
        return res.status(400).json({ error: "Maximum storage space reached for this workspace" });
      }

      AzureUtils.initialize();

      const blobName = `${EAzureFolder.Workspace}/${workspaceId}/${moment().format("YYYYMMDDHHmmss")}`;
      const containerClient = AzureUtils.getContainerClient(env.containerName);
      const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
      await blockBlobClient.uploadData(file?.data, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype || "application/octet-stream",
        },
      });

      const blobUrl = `${env.containerName}/${blobName}`;

      await this.documentRepository.update(
        { id: documentData.id },
        {
          categoryId,
          folderId,
          file: blobUrl,
          name: file?.name,
          size: file?.size,
          isEditable,
          isDownloadable,
          mimeType: file.mimetype,
        },
      );

      const folder = await this.folderRepository.findOne({
        where: {
          workspaceId,
          id: +folderId || documentData.folderId,
        },
      });

      const category = await this.categoryRepository.findOne({
        where: {
          workspaceId,
          id: +categoryId || documentData.categoryId,
        },
      });

      const documentDetail = {
        file: blobUrl,
        size: size.toString(),
        workspaceId,
        fileName: file?.name,
        category: category.name,
        folder: folder.name,
        isEditable,
        isDownloadable,
        status: EActivityStatus.Document_Updated,
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
          isEditable,
          isDownloadable,
        },
      );

      const folder = await this.folderRepository.findOne({
        where: {
          workspaceId,
          id: +folderId || documentData.folderId,
        },
      });

      const category = await this.categoryRepository.findOne({
        where: {
          workspaceId,
          id: +categoryId || documentData.categoryId,
        },
      });

      const documentDetail = {
        file: documentData.file,
        size: documentData.size.toString(),
        workspaceId,
        fileName: documentData.name,
        category: category.name,
        folder: folder.name,
        isEditable,
        isDownloadable,
        status: EActivityStatus.Document_Updated,
      };

      const log = await this.logRepository.create({
        metadata: documentDetail,
        workspaceId,
        activity: ELogsActivity.Document_Upload,
        userId: me.id,
      });
      await this.logRepository.save(log);
    }
    return res.status(200).json({ msg: l10n.t("DOCUMENT_UPDATE_SUCCESS") });
  };
}
