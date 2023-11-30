import { SettingEntity } from "@entities";
import { TResponse, TRequest } from "@types";
import { Repository } from "typeorm";
import { InitRepository, InjectRepositories } from "@helpers";

export class SettingController {
  @InitRepository(SettingEntity)
  settingRepository: Repository<SettingEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public updateQANotification = async (req: TRequest, res: TResponse) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    const currentSetting = await this.settingRepository.findOne({ where: { userId: me.id, workspaceId } });

    const updatedStatus = !currentSetting.isQANotification;

    await this.settingRepository.update(
      { userId: me.id, workspaceId },
      {
        isQANotification: updatedStatus,
      },
    );

    res.sendStatus(200);
  };

  public isTeamSpecificQA = async (req: TRequest, res: TResponse) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;

    const currentSetting = await this.settingRepository.findOne({ where: { userId: me.id, workspaceId } });

    const updatedStatus = !currentSetting.isTeamSpecificQA;

    await this.settingRepository.update(
      { userId: me.id, workspaceId },
      {
        isTeamSpecificQA: updatedStatus,
      },
    );

    res.sendStatus(200);
  };
}
