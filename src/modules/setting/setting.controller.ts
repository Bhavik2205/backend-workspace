import { SettingEntity } from "@entities";
import { TResponse, TRequest } from "@types";
import { Repository } from "typeorm";
import { InitRepository, InjectRepositories } from "@helpers";
import { UpdateFeedbackDto } from "./dto/update-feedback.dto";
import axios from "axios";

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

  //feedback feature
  public isFeedbackActive = async (req: TRequest<UpdateFeedbackDto>, res: TResponse) => {
    const { me } = req;
    const { workspaceid: workspaceId } = req.headers;
    const { link } = req.dto;

    const currentSetting = await this.settingRepository.findOne({ where: {userId: me.id, workspaceId } });

    const updatedStatus = !currentSetting.isFeedbackActive;

    if(updatedStatus === true) {
      if (!link || link.trim() === '') {
        return res.status(400).json({ message: 'URL is mandatory when feedback is enabled.' });
      }

      // Check if the provided link is reachable
      try {
        await axios.head(link);
      } catch (error) {
         return res.status(400).json({error: "Provided link is not reachable or valid."})
      }
      await this.settingRepository.update(
        { userId: me.id, workspaceId },
        {
          isFeedbackActive: updatedStatus,
          link: link
        }
      )
    } else {
      await this.settingRepository.update(
        { userId: me.id, workspaceId },
        {
          isFeedbackActive: updatedStatus,
        }
      )
    }

    return res.status(200).json({feedback: updatedStatus ? "enabled": "disabled" ,link: updatedStatus ? link || null : null});
  }
}
