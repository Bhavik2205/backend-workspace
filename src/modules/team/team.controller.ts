import { ParticipateEntity, TeamEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories, Notification } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { env } from "@configs";
import { CreateMultipleParticipateDto, CreateTeamDto } from "./dto";

export class TeamController {
  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateTeamDto>, res: TResponse) => {
    const { name } = req.dto;
    const { workspaceid: workspaceId } = req.headers;

    const team = await this.teamRepository.create({
      name,
      workspaceId,
    });

    await this.teamRepository.save(team);
    res.status(200).json({ msg: l10n.t("TEAM_CREATE_SUCCESS"), data: team });
  };

  public read = async (req: TRequest, res: TResponse) => {
    const { page, limit } = req.pager;
    const { workspaceid: workspaceId } = req.headers;

    const [data, count] = await this.teamRepository.findAndCount({
      where: {
        workspaceId,
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

  public createParticipates = async (req: TRequest<CreateMultipleParticipateDto>, res: TResponse) => {
    const { teamId } = req.params;
    const { workspaceid: workspaceId } = req.headers;

    const participantsData = req.dto.participatesData;
    const responses: { msg: string; email: string }[] = [];

    const promises = participantsData.map(async participantData => {
      const { email, roleId } = participantData;

      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        const emailData = {
          link: `${env.domain}/sign-up`,
        };

        const participate = this.participateRepository.create({
          teamId: +teamId,
          roleId,
          email,
          workspaceId,
          isInvited: true,
        });

        await this.participateRepository.save(participate);
        await Notification.email("invitation", emailData, [email]);

        responses.push({ msg: "Invitation sent", email });
      } else {
        const userExists = await this.participateRepository.findOne({
          where: {
            userId: user.id,
          },
        });

        if (userExists) {
          responses.push({ msg: "User already participating", email });
        } else {
          const participate = this.participateRepository.create({
            teamId: +teamId,
            roleId,
            workspaceId,
            userId: user.id,
            email,
            isInvited: false,
          });

          await this.participateRepository.save(participate);
          responses.push({ msg: l10n.t("PARTICIPATE_CREATE_SUCCESS"), email });
        }
      }
    });

    await Promise.all(promises);

    res.status(200).json(responses);
  };

  public readParticipate = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;

    const data = await this.teamRepository
      .createQueryBuilder("teams")
      .leftJoinAndSelect("teams.participates", "participates")
      .leftJoinAndSelect("participates.user", "user")
      .select([
        "teams.id",
        "teams.name",
        "teams.workspaceId",
        "participates.id",
        "participates.roleId",
        "participates.isInvited",
        "participates.userId",
        "user.firstName",
        "user.lastName",
        "user.email",
      ])
      .where({ workspaceId })
      .getMany();

    res.status(200).json({
      data,
    });
  };

  public deleteParticipate = async (req: TRequest, res: TResponse) => {
    const { participateId } = req.params;

    await this.participateRepository.delete(participateId);

    res.status(200).json({ msg: l10n.t("PARTICIPATE_DELETE_SUCCESS") });
  };

  public readUserTeam = async (req: TRequest, res: TResponse) => {
    const { me } = req;

    const data = await this.participateRepository.findOne({
      where: {
        userId: me.id,
      },
    });

    if (!data) {
      return res.status(404).json({ error: "User is not a member of any team" });
    }

    const teamData = await this.teamRepository.findOne({
      where: {
        id: data.teamId,
      },
    });

    return res.status(200).json({
      data: teamData,
    });
  };
}
