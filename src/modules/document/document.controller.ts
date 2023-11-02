import { DocumentEntity, FolderEntity, LogEntity } from "@entities";
import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest, EAzureFolder, ELogsActivity } from "@types";
import { Repository } from "typeorm";
import { AzureUtils, InitRepository, InjectRepositories, Utils } from "@helpers";
import { env } from "@configs";
import moment from "moment";
import { CreateDocumentDto } from "./dto";

export class DocumentController {
  @InitRepository(DocumentEntity)
  documentRepository: Repository<DocumentEntity>;

  @InitRepository(FolderEntity)
  folderRepository: Repository<FolderEntity>;

  @InitRepository(LogEntity)
  logRepository: Repository<LogEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateDocumentDto>, res: TResponse) => {
    const { categoryId, folderId, isEditable, isDownloadable } = req.dto;
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;
    const { file } = req.files;

    AzureUtils.initialize();

    const blobName = `${EAzureFolder.Workspace}/${workspaceId}/${moment().format("YYYYMMDDHHmmss")}`;
    const containerClient = AzureUtils.getContainerClient(env.containerName);
    const blockBlobClient = AzureUtils.getBlockBlobClient(blobName, containerClient);
    await blockBlobClient.uploadData(file.data, file.size);

    const blobUrl = `${env.containerName}/${blobName}`;

    const updatedDocument = await this.documentRepository.create({
      categoryId,
      folderId,
      file: blobUrl,
      name: file.name,
      size: file.size,
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

    return res.status(200).json({ msg: l10n.t("DOCUMENT_UPLOAD_SUCCESS"), data: document });
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
      ])
      .where({ workspaceId })
      .getMany();

    documents.forEach(folder => {
      folder.document.forEach(e => {
        e.file = `${env.azureURL}${e.file}`;
      });
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
}
