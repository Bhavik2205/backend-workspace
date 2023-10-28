import { Roles } from "@types";
import { migratePermissionsMapToRolePermissionsMap } from "../helpers";
import { Permissions } from "./permissions.enum";

type PermissionsMap = {
  [key in Permissions]: Roles[];
};

export const getRolePermissions = () => {
  const permissions: PermissionsMap = {
    [Permissions.DocumentUpload]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.DocumentDownload]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.DocumentSearch]: [Roles.Super_Admin, Roles.Admin, Roles.QA, Roles.Viewer],
    [Permissions.CreateNewFolder]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.CreateNewQA]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.DeleteQA]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.EditQA]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.ViewQA]: [Roles.Viewer],
    [Permissions.DownloadLog]: [Roles.Super_Admin, Roles.Admin],
    [Permissions.EditSettings]: [Roles.Super_Admin],
    [Permissions.AddTaskAndDueDate]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.DeleteTask]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.EditTask]: [Roles.Super_Admin, Roles.Admin, Roles.QA],
    [Permissions.InviteParticipatesGlobally]: [Roles.Super_Admin],
    [Permissions.InviteParticipates]: [Roles.Super_Admin, Roles.Admin],
    [Permissions.RemoveParticipatesGlobally]: [Roles.Super_Admin],
    [Permissions.RemoveParticipate]: [Roles.Super_Admin, Roles.Admin],
    [Permissions.AddDeleteTeam]: [Roles.Super_Admin],
  };

  return migratePermissionsMapToRolePermissionsMap(permissions);
};
