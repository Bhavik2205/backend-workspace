import { LogEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { ELogsActivity, TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

function getActivityEnumValue(activity: string): ELogsActivity {
  return Object.values(ELogsActivity).find(value => value === activity);
}

export class LogController {
  @InitRepository(LogEntity)
  logRepository: Repository<LogEntity>;

  constructor() {
    InjectRepositories(this);
  }

  // public download = async (req: TRequest, res: TResponse) => {
  //   try {
  //     const { activity } = req.query;
  //     const data = (activity as string).split(",");
  //     const json2csvParser = new Parser();

  //     const logsPromises = data.map(act => {
  //       const activityEnumValue = getActivityEnumValue(act);
  //       return this.logRepository.find({
  //         where: {
  //           activity: activityEnumValue,
  //         },
  //       });
  //     });

  //     const logsResults = await Promise.all(logsPromises);
  //     let combinedCsv = "";

  //     data.forEach((act, index) => {
  //       const logs = logsResults[index];

  //       if (logs && logs.length > 0) {
  //         combinedCsv += `Activity: ${act}\n`;
  //         const csv = json2csvParser.parse(logs);
  //         combinedCsv += `${csv}\n\n`;
  //       }
  //     });

  //     const filename = `log.csv`;

  //     res.attachment(filename);
  //     res.status(200).send(combinedCsv);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  public download = async (req: TRequest, res: TResponse) => {
    try {
      const { activity } = req.query;
      const data = (activity as string).split(",");
      const { workspaceid: workspaceId } = req.headers;

      const logsPromises = data.map(async act => {
        const activityEnumValue = getActivityEnumValue(act);
        const logs = await this.logRepository
          .createQueryBuilder("logs")
          .leftJoinAndSelect("logs.user", "user")
          .leftJoinAndSelect("logs.workspace", "workspace")
          .select([
            "logs",
            "user.email",
            "user.firstName",
            "user.lastName",
            "workspace.name"
          ])
          .where({
            activity: activityEnumValue,
            workspaceId: +workspaceId })
          .getMany();

        return { activity: act, data: logs };
      });

      const logsResults = await Promise.all(logsPromises);

      res.status(200).json({ data: logsResults });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
