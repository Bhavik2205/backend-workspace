import { InitRepository, InjectRepositories, Utils } from "@helpers";
import { EWorkflowStatus, TRequest, TResponse } from "@types";
import { Between, FindOperator, Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { ParticipateEntity, WorkflowEntity } from "@entities";
import moment from "moment";
import { env } from "@configs";
import { CreateWorkflowDto, UpdateWorkflowDto, SetDueDateDto } from "./dto";

const { Parser } = require("json2csv");

type TWorkflowFilter = {
  status?: string;
  dueDate?: FindOperator<Date>;
  teamId?: string;
};

export class WorkflowController {
  @InitRepository(WorkflowEntity)
  workflowRepository: Repository<WorkflowEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateWorkflowDto>, res: TResponse) => {
    const { name } = req.dto;
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    const workflow = await this.workflowRepository.create({
      name,
      workspaceId,
      userId: me.id,
      status: EWorkflowStatus.Pending,
    });

    const workflowDetail = await this.workflowRepository.save(workflow);

    const questionNumber = Utils.generateRandomNumber(workflow.userId, workspaceId, workflow.id);
    workflow.taskNum = parseInt(questionNumber, 10);

    await this.workflowRepository.save(workflowDetail);
    res.status(200).json({ msg: l10n.t("WORKFLOW_CREATE_SUCCESS"), data: workflowDetail });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;
    const { filter: filterJson = "{}" } = req.query;

    const { status, startDate, endDate, teamId } = JSON.parse(filterJson as string);
    const extraFilters: TWorkflowFilter = {};

    if (status) {
      extraFilters.status = status;
    }

    if (startDate && endDate) {
      extraFilters.dueDate = Between(startDate, endDate);
    }

    if (teamId) {
      extraFilters.teamId = teamId;
    }

    const workflow = await this.workflowRepository
      .createQueryBuilder("workflow")
      .leftJoinAndSelect("workflow.user", "createdBy")
      .leftJoinAndSelect("workflow.participates", "participates")
      .leftJoinAndSelect("participates.user", "user")
      .leftJoinAndSelect("participates.teams", "teams")
      .select(["workflow", "createdBy.firstName", "createdBy.lastName", "participates.id", "user.firstName", "user.lastName", "user.email", "user.imageUrl", "teams.name"])
      .where({ ...extraFilters, workspaceId })
      .getMany();

    workflow.map(data => {
      const modifiedData = { ...data };
      const images = modifiedData.participates?.user?.imageUrl;

      if (images) {
        modifiedData.participates.user.imageUrl = `${env.azureURL}${images}`;
      }

      return modifiedData;
    });

    res.status(200).json({ data: workflow });
  };

  public update = async (req: TRequest<UpdateWorkflowDto>, res: TResponse) => {
    const { workflowId } = req.params;
    const { allocate, status } = req.dto;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const teamDetails = await this.participateRepository.findOne({
        where: {
          id: allocate,
        },
      });

      await this.workflowRepository.update(workflowId, {
        allocate,
        status,
        teamId: teamDetails.teamId,
      });

      const workflow = await this.workflowRepository.findOne({
        where: {
          id: +workflowId,
          workspaceId,
        },
      });

      res.status(200).json({ msg: l10n.t("WORKFLOW_UPDATE_SUCCESS"), data: workflow });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { workflowId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const workflow = await this.workflowRepository.findOne({
        where: {
          id: +workflowId,
          workspaceId,
        },
      });

      await this.workflowRepository.remove(workflow);

      res.status(200).json({ msg: l10n.t("WORKFLOW_DELETE_SUCCESS") });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public setDueDate = async (req: TRequest<SetDueDateDto>, res: TResponse) => {
    const { dueDate } = req.dto;
    const { workflowId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const date = moment(dueDate, "YYYY-MM-DD").format("YYYY-MM-DD");

      await this.workflowRepository.update(workflowId, {
        dueDate: date,
      });

      const workflow = await this.workflowRepository.findOne({
        where: {
          id: +workflowId,
          workspaceId,
        },
      });

      res.status(200).json({ msg: l10n.t("DUEDATE_UPDATED_SUCCESS"), data: workflow });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public deleteDueDate = async (req: TRequest, res: TResponse) => {
    const { workflowId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    try {
      const data = await this.workflowRepository.findOne({
        where: {
          id: +workflowId,
          workspaceId,
        },
      });
      data.dueDate = null;
      await this.workflowRepository.save(data);

      res.status(200).json({ msg: l10n.t("DUEDATE_DELETE_SUCCESS") });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public download = async (req: TRequest, res: TResponse) => {
    try {
      const { workspaceid: workspaceId } = req.headers;
      const { workflowId } = req.params;

      const workflow = await this.workflowRepository.find({
        where: {
          workspaceId,
          id: +workflowId,
        },
      });
      const fileFields = ["name", "workspaceId", "dueDate", "taskNum", "status", "createdAt", "updatedAt"];
      const json2csvParser = new Parser({ fields: fileFields });
      const csv = json2csvParser.parse(workflow);
      res.attachment("workflow.csv");
      res.status(200).send(csv);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
