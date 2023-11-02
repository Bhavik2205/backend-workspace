import { QuestionEntity, AnswersEntity, TeamEntity, ParticipateEntity, SettingEntity } from "@entities";
import { InitRepository, InjectRepositories, Utils } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { env } from "@configs";
import { CreateAnswerDto, CreateQuestionDto } from "./dto";

export class QuestionController {
  @InitRepository(QuestionEntity)
  questionRepository: Repository<QuestionEntity>;

  @InitRepository(AnswersEntity)
  answerRepository: Repository<AnswersEntity>;

  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(SettingEntity)
  settingRepository: Repository<SettingEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateQuestionDto>, res: TResponse) => {
    const { topic, to, from, question, documentId, sendForApproval, isHighPriority, isClosed } = req.dto;
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    const questionDetail = await this.questionRepository.create({
      topic,
      to,
      from,
      question,
      documentId,
      userId: me.id,
      sendForApproval,
      isHighPriority,
      isClosed,
      isNew: true,
      workspaceId,
    });

    const questionData = await this.questionRepository.save(questionDetail);

    const questionNumber = Utils.generateRandomNumber(questionDetail.userId, workspaceId, questionDetail.id);
    questionDetail.queNum = parseInt(questionNumber, 10);

    await this.questionRepository.save(questionData);
    res.status(200).json({ msg: l10n.t("QUESTION_CREATE_SUCCESS"), data: questionDetail });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    const participateData = await this.participateRepository.findOne({
      where: {
        userId: me.id,
      },
    });

    if (!participateData) {
      return res.status(404).json({ error: "User is not a member of any team" });
    }

    const teamData = await this.teamRepository.findOne({
      where: {
        id: participateData.teamId,
      },
    });

    const settings = await this.settingRepository.findOne({
      where: {
        userId: me.id,
      },
    });

    if (settings.isTeamSpecificQA === true) {
      const questionDetail = await this.questionRepository
        .createQueryBuilder("question")
        .leftJoinAndSelect("question.user", "user")
        .leftJoinAndSelect("question.queFrom", "from")
        .leftJoinAndSelect("question.queTo", "to")
        .select([
          "question.id",
          "question.topic",
          "question.to",
          "question.from",
          "question.question",
          "question.documentId",
          "question.sendForApproval",
          "question.isHighPriority",
          "question.isClosed",
          "question.isNew",
          "question.workspaceId",
          "question.queNum",
          "question.userId",
          "question.createdAt",
          "question.updatedAt",
          "user.firstName",
          "user.lastName",
          "from.name",
          "to.name",
        ])
        .where("(question.to = :teamId OR question.from = :teamId) AND (question.workspaceId = :workspaceId)", {
          teamId: teamData.id,
          workspaceId,
        })
        .getMany();

      return res.status(200).json({ data: questionDetail });
    }
    const questionDetail = await this.questionRepository
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.user", "user")
      .leftJoinAndSelect("question.queFrom", "from")
      .leftJoinAndSelect("question.queTo", "to")
      .select([
        "question.id",
        "question.topic",
        "question.to",
        "question.from",
        "question.question",
        "question.documentId",
        "question.sendForApproval",
        "question.isHighPriority",
        "question.isClosed",
        "question.isNew",
        "question.workspaceId",
        "question.queNum",
        "question.userId",
        "question.createdAt",
        "question.updatedAt",
        "user.firstName",
        "user.lastName",
        "from.name",
        "to.name",
      ])
      .where({
        workspaceId,
      })
      .getMany();

    return res.status(200).json({ data: questionDetail });
  };

  public readOne = async (req: TRequest, res: TResponse) => {
    const { questionId } = req.params;
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    const participateData = await this.participateRepository.findOne({
      where: {
        userId: me.id,
      },
    });

    if (!participateData) {
      return res.status(404).json({ error: "User is not a member of any team" });
    }
    const questionDetail = await this.questionRepository
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.user", "user")
      .leftJoinAndSelect("question.answer", "answer")
      .leftJoinAndSelect("answer.user", "userAns")
      .leftJoinAndSelect("question.queFrom", "from")
      .leftJoinAndSelect("question.queTo", "to")
      .leftJoinAndSelect("question.document", "document")
      .select([
        "question.id",
        "question.topic",
        "question.to",
        "question.to",
        "question.from",
        "question.question",
        "question.documentId",
        "question.sendForApproval",
        "question.isHighPriority",
        "question.isClosed",
        "question.isNew",
        "question.workspaceId",
        "question.queNum",
        "question.userId",
        "question.createdAt",
        "question.updatedAt",
        "user.firstName",
        "user.lastName",
        "answer.answer",
        "userAns.firstName",
        "userAns.lastName",
        "from.name",
        "to.name",
        "document.file",
        "document.name",
      ])
      .where({
        id: questionId,
        workspaceId,
      })
      .getMany();
    
    questionDetail.map(data => {
      const modifiedData = { ...data };
      const file = modifiedData?.document?.file;
  
      if (file) {
        modifiedData.document.file = `${env.azureURL}${file}`;
      }
  
      return modifiedData;
    });


    return res.status(200).json({ data: questionDetail });
  };

  public delete = async (req: TRequest, res: TResponse) => {
    const { questionId } = req.params;

    await this.questionRepository.delete(questionId);

    res.status(200).json({ msg: l10n.t("QUESTION_DELETE_SUCCESS") });
  };

  public createAnswer = async (req: TRequest<CreateAnswerDto>, res: TResponse) => {
    const { questionId } = req.params;
    const { answer } = req.dto;
    const { me } = req;

    const answerDetail = await this.answerRepository.create({
      questionId: +questionId,
      answer,
      userId: me.id,
    });

    await this.questionRepository.update(questionId, {
      isNew: false,
    });

    await this.answerRepository.save(answerDetail);
    res.status(200).json({ msg: l10n.t("ANSWER_SUBMITTED_SUCCESS"), data: answerDetail });
  };
}
