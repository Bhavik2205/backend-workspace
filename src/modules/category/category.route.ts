import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware } from "@middlewares";
import { CategoryController } from "./category.controller";
import { CreateCategoryDto } from "./dto";

export class CategoryRouter extends SFRouter implements RouterDelegates {
  @InjectCls(CategoryController)
  private categoryController: CategoryController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateCategoryDto), this.authMiddleware.auth, isWorkspaceExist(), this.categoryController.create);
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.categoryController.read);
  }
}
