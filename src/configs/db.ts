import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { Log } from "../helpers/logger.helper";

export class DB {
  public logger = Log.getLogger(`${path.relative(process.cwd(), __dirname)}/${this.constructor.name}`);

  public static ds(): DataSource {
    return this.gI().dataSource;
  }

  private static instance: DB;

  public static init(config: DataSourceOptions) {
    if (!DB.instance) {
      DB.instance = new DB(config);
    }
  }

  private static gI(): DB {
    return DB.instance;
  }

  private dataSource: DataSource;

  constructor(config: DataSourceOptions) {
    this.dataSource = new DataSource(config);

    try {
      this.dataSource.initialize();
      this.logger.info("DB Connection has been established successfully.");
    } catch (error) {
      this.logger.error(`Unable to connect to the database: ${error}`);
    }
  }
}
