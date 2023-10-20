import { LogEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import { Parser } from "json2csv";
import { DownloadDto } from "./dto";

export class LogController {
  @InitRepository(LogEntity)
  logRepository: Repository<LogEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public download = async (req: TRequest<DownloadDto>, res: TResponse) => {
    try {
      const { activity: activities } = req.dto;

      const json2csvParser = new Parser();

      const logsPromises = activities.map(act =>
        this.logRepository.find({
          where: {
            activity: act,
          },
        }),
      );

      const logsResults = await Promise.all(logsPromises);

      const csv = logsResults.map(logs => json2csvParser.parse(logs));

      let combinedCsv = "";

      activities.forEach((act, index) => {
        combinedCsv += `Activity: ${act}\n`;
        combinedCsv += `${csv[index]}\n\n`;
      });

      const filename = `log.csv`;

      res.attachment(filename);
      res.status(200).send(combinedCsv);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
