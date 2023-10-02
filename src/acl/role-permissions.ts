import { Roles } from "@types";
import { migratePermissionsMapToRolePermissionsMap } from "../helpers";
import { Permissions } from "./permissions.enum";

type PermissionsMap = {
  [key in Permissions]: Roles[];
};

export const getRolePermissions = () => {
  const permissions: PermissionsMap = {};

  return migratePermissionsMapToRolePermissionsMap(permissions);
};
