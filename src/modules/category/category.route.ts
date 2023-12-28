import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware, Subscription } from "@middlewares";
import { CategoryController } from "./category.controller";
import { CreateCategoryDto } from "./dto";

export class CategoryRouter extends SFRouter implements RouterDelegates {
  @InjectCls(CategoryController)
  private categoryController: CategoryController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  initRoutes(): void {
    this.router.post("/", this.authMiddleware.auth, this.subscription.isSubscribed, Validator.validate(CreateCategoryDto), isWorkspaceExist(), this.categoryController.create);
    this.router.get("/", this.authMiddleware.auth, this.subscription.isSubscribed, isWorkspaceExist(), this.categoryController.read);
  }
}
