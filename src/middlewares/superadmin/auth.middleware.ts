import { TRequest, TResponse } from "@types";
import { InitRepository, InjectRepositories, JwtHelper } from "@helpers";
import { Repository } from "typeorm";
import { LoginInfoEntity } from "../../entities/superadmin";

export class AuthMiddleware {
  @InitRepository(LoginInfoEntity)
  loginInfoRepository: Repository<LoginInfoEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public auth: any = async (req: TRequest, res: TResponse, next: () => void) => {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.toString().replace("Bearer ", "")
      const tokenInfo: any = JwtHelper.decode(token);

      if (tokenInfo) {
        const user = await this.loginInfoRepository.findOne({
          where: { token: token, userId: tokenInfo.id , status: true},
        });
        if (user) {
          req.me = tokenInfo.id;
          next();
        } else {
          res.status(401).json({ error: "Unauthorized", code: 401 });
        }
      } else {
        res.status(401).json({ error: "Unauthorized", code: 401 });
      }
    } else {
      res.status(401).json({ error: "Unauthorized", code: 401 });
    }
  };
}
