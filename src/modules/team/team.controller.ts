import { LogEntity, ParticipateEntity, TeamEntity, UserEntity, UserRolesEntity } from "@entities";
import { InitRepository, InjectRepositories, Notification } from "@helpers";
import { EActivityStatus, ELogsActivity, TRequest, TResponse } from "@types";
import { In, Repository } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { env } from "@configs";
import { CreateMultipleParticipateDto, CreateTeamDto, UpdateTeamDto } from "./dto";

export class TeamController {
  @InitRepository(TeamEntity)
  teamRepository: Repository<TeamEntity>;

  @InitRepository(ParticipateEntity)
  participateRepository: Repository<ParticipateEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(LogEntity)
  logRepository: Repository<LogEntity>;

  @InitRepository(UserRolesEntity)
  userRolesRepository: Repository<UserRolesEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateTeamDto>, res: TResponse) => {
    const { name } = req.dto;
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;

    const team = await this.teamRepository.create({
      name,
      workspaceId,
    });

    const teamData = {
      name,
      Status: EActivityStatus.Team_Created,
    };

    const log = this.logRepository.create({
      metadata: teamData,
      workspaceId,
      activity: ELogsActivity.Participant_And_Team_Add_Remove,
      userId: me.id,
    });
    await this.logRepository.save(log);

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
    const { me } = req;

    const participantsData = req.dto.participatesData;

    const dataPromises = participantsData.map(async participants => participants.email);
    const data = await Promise.all(dataPromises);

    const existData = await this.participateRepository.find({
      where: {
        email: In(data),
        workspaceId,
      },
    });
    const existingEmail = existData.map(e => e.email);

    if (existingEmail.length > 0) {
      return res.status(400).json({ msg: l10n.t("PARTICIPATE_EXISTS"), data: existingEmail });
    }

    const promises = participantsData.map(async participantData => {
      const { email, roleId } = participantData;

      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        const emailData = {
          link: `${env.domain}/sign-up`,
        };

        const invitedParticipate = await this.participateRepository.findOne({
          where: {
            email,
            workspaceId,
          },
        });

        if (!invitedParticipate) {
          const participate = this.participateRepository.create({
            teamId: +teamId,
            roleId,
            email,
            workspaceId,
            isInvited: true,
          });

          const participantsDetail = {
            teamId: +teamId,
            isInvited: true,
            Status: EActivityStatus.Participant_Created,
          };

          const log = await this.logRepository.create({
            metadata: participantsDetail,
            workspaceId,
            activity: ELogsActivity.Participant_And_Team_Add_Remove,
            userId: me.id,
          });
          await this.logRepository.save(log);

          await this.participateRepository.save(participate);

          const userRole = await this.userRolesRepository.create({
            participateId: participate.id,
            roleId,
          });
          await this.userRolesRepository.save(userRole);

          await Notification.email("invitation", emailData, [email]);
        }
      } else {
        const userExists = await this.participateRepository.findOne({
          where: {
            userId: user.id,
            workspaceId,
          },
        });

        if (!userExists) {
          const participate = this.participateRepository.create({
            teamId: +teamId,
            roleId,
            workspaceId,
            userId: user.id,
            email,
            isInvited: false,
          });

          const participantsDetail = {
            teamId: +teamId,
            isInvited: false,
            Status: EActivityStatus.Participant_Created,
          };

          const log = await this.logRepository.create({
            metadata: participantsDetail,
            workspaceId,
            activity: ELogsActivity.Participant_And_Team_Add_Remove,
            userId: me.id,
          });
          await this.logRepository.save(log);

          await this.participateRepository.save(participate);

          const userRole = await this.userRolesRepository.create({
            userId: user.id,
            participateId: participate.id,
            roleId,
          });
          await this.userRolesRepository.save(userRole);
        }
      }
    });

    await Promise.all(promises);
    return res.status(200).json({ msg: l10n.t("PARTICIPATE_CREATE_SUCCESS") });
  };

  public readParticipate = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;

    const data = await this.teamRepository
      .createQueryBuilder("teams")
      .leftJoinAndSelect("teams.participates", "participates")
      .leftJoinAndSelect("participates.user", "user")
      .leftJoinAndSelect("participates.roles", "roles")
      .select([
        "teams.id",
        "teams.name",
        "teams.workspaceId",
        "participates.id",
        "participates.roleId",
        "participates.isInvited",
        "participates.email",
        "participates.userId",
        "user.firstName",
        "user.lastName",
        "user.email",
        "roles.role",
        "user.imageUrl",
      ])
      .where({ workspaceId })
      .getMany();

    const modifiedData = data.map(e => ({
      ...e,
      participates: e.participates.map(user => ({
        ...user,
        user: user.user
          ? {
            ...user.user,
            imageUrl: user.user.imageUrl ? `${env.azureURL}${user.user.imageUrl}` : null,
          }
          : null,
      })),
    }));

    res.status(200).json({
      data: modifiedData,
    });
  };

  public deleteParticipate = async (req: TRequest, res: TResponse) => {
    const { participateId } = req.params;
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    await this.participateRepository.delete(participateId);

    const participantsDetail = {
      participateId: +participateId,
      status: EActivityStatus.Participant_Remove,
    };

    const log = await this.logRepository.create({
      metadata: participantsDetail,
      workspaceId,
      activity: ELogsActivity.Participant_And_Team_Add_Remove,
      userId: me.id,
    });
    await this.logRepository.save(log);

    res.status(200).json({ msg: l10n.t("PARTICIPATE_DELETE_SUCCESS") });
  };

  public readUserTeam = async (req: TRequest, res: TResponse) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers; 

    const data = await this.participateRepository.findOne({
      where: {
        userId: me.id,
        workspaceId
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

  public readAllParticipate = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;

    const data = await this.participateRepository
      .createQueryBuilder("participates")
      .leftJoinAndSelect("participates.user", "user")
      .select(["participates.id", "participates.userId", "participates.workspaceId", "user.firstName", "user.lastName"])
      .where({ workspaceId })
      .getMany();

    res.status(200).json({
      data,
    });
  };

  public updateTeam = async (req: TRequest<UpdateTeamDto>, res: TResponse) => {
    const { name } = req.dto;
    const { workspaceid: workspaceId } = req.headers;
    const { me } = req;
    const { teamId } = req.params;

    const updateTeamData = await this.teamRepository.findOne({
      where: {
        id: +teamId,
        workspaceId,
      },
    });

    await this.teamRepository.update(
      { id: updateTeamData.id },
      {
        name,
        workspaceId,
      },
    );

    const teamData = {
      name,
      Status: EActivityStatus.Team_Update,
    };

    const log = this.logRepository.create({
      metadata: teamData,
      workspaceId,
      activity: ELogsActivity.Participant_And_Team_Add_Remove,
      userId: me.id,
    });
    await this.logRepository.save(log);

    const updatedData = await this.teamRepository.findOne({
      where: {
        id: +teamId,
        workspaceId,
      },
    });

    res.status(200).json({ msg: l10n.t("TEAM_UPDATE_SUCCESS"), data: updatedData });
  };

  public DeleteTeam = async (req: TRequest, res: TResponse) => {
    const { workspaceid: workspaceId } = req.headers;
    const { teamId } = req.params;
    const { me } = req;

    const team = await this.teamRepository.findOne({
      where: {
        id: +teamId,
        workspaceId,
      },
    });

    await this.teamRepository.remove(team);

    const teamData = {
      name: team.name,
      Status: EActivityStatus.Team_Remove,
    };

    const log = this.logRepository.create({
      metadata: teamData,
      workspaceId,
      activity: ELogsActivity.Participant_And_Team_Add_Remove,
      userId: me.id,
    });
    await this.logRepository.save(log);

    res.status(200).json({ msg: l10n.t("TEAM_DELETE_SUCCESS") });
  };
}
