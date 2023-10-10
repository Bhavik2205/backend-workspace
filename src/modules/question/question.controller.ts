import { QuestionEntity, AnswersEntity } from "@entities";
import { InitRepository, InjectRepositories, RandomNumberGenerator } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { CreateAnswerDto, CreateQuestionDto } from "./dto";

export class QuestionController {
  @InitRepository(QuestionEntity)
  questionRepository: Repository<QuestionEntity>;

  @InitRepository(AnswersEntity)
  answerRepository: Repository<AnswersEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateQuestionDto>, res: TResponse) => {
    const { topic, to, from, question, documentId, sendForApproval, isHighPriority, isClosed } = req.dto;
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    const queNum = RandomNumberGenerator.generate();

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
      queNum,
    });

    await this.questionRepository.save(questionDetail);
    res.status(200).json({ msg: l10n.t("QUESTION_CREATE_SUCCESS"), data: questionDetail });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;

    const questionDetail = await this.questionRepository
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.user", "user")
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
      ])
      .where({ workspaceId })
      .getMany();

    res.status(200).json({ data: questionDetail });
  };

  public readOne = async (req: TRequest, res: TResponse) => {
    const { questionId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    const questionDetail = await this.questionRepository
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.user", "user")
      .leftJoinAndSelect("question.answer", "answer")
      .leftJoinAndSelect("answer.user", "userAns")
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
      ])
      .where({ id: questionId, workspaceId })
      .getMany();

    res.status(200).json({ data: questionDetail });
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
