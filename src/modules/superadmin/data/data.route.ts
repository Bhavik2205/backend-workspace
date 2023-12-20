import { RouterDelegates } from "@types";
import { InjectCls, SFRouter } from "@helpers";
import { AuthMiddleware } from "../../../middlewares/superadmin/index";
import { DataController } from "./data.controller";

export class DataRouter extends SFRouter implements RouterDelegates {
    @InjectCls(DataController)
    private dataController: DataController

    @InjectCls(AuthMiddleware)
    private authMiddleware: AuthMiddleware

    initRoutes(): void {
        this.router.get('/users',this.authMiddleware.auth, this.dataController.listUsers);
        this.router.post('/downloadselected', this.authMiddleware.auth, this.dataController.downloadSelected);
        this.router.get('/downloadall', this.authMiddleware.auth, this.dataController.downloadAll);
    }
}