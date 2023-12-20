import { Repository, createConnection, getConnection } from "typeorm";
import * as l10n from "jm-ez-l10n";
import { TRequest, TResponse, EUserType } from "@types";
import {
  Bcrypt,
  InitRepository,
  InjectRepositories,
  JwtHelper,
  Notification,
} from "@helpers";
import { SuperadminUserEntity } from "../../../entities/superadmin";
import { UserEntity } from "@entities";


export class DataController {
    @InitRepository(SuperadminUserEntity)
    adminRepository: Repository<SuperadminUserEntity>

    @InitRepository(UserEntity)
    userRepository: Repository<UserEntity>

    constructor() {
        InjectRepositories(this)
    }

    public listUsers: any = async(req: TRequest, res: TResponse) => {
        try {
            const userslist = await this.userRepository.find({
                where: {
                    isActive: true,
                }
            })

            if(userslist.length < 1) {
                return res.status(200).json({message: "No users found."});
            }

            return res.status(200).json({message: userslist});
        } catch (error: any) {
            console.log({error: error.message})
            return res.status(500).json({error: l10n.t("ERR_INTERNAL_SERVER")})
        }
    }

    public downloadSelected: any = async(req: TRequest, res: TResponse) => {
        try {
            
        } catch (error) {
            return res.status(500).json({error: l10n.t("ERR_INTERNAL_SERVER")})
        }
    }

    public downloadAll: any = async(req: TRequest, res: TResponse) => {
        try {
            
        } catch (error) {
            return res.status(500).json({error: l10n.t("ERR_INTERNAL_SERVER")})
        }
    }
}