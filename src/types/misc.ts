export enum EWorkspacePurpose {
  Pre_Seed_Funding = "Pre-Seed Funding",
  Seed_Stage_Funding = "Seed Stage Funding",
  Series_A = "Series A",
  Series_B_Onwards = "Series B onwards",
  Pre_IPO = "Pre IPO",
  IPO = "IPO",
  Legal = "Legal",
  Financing_loans_credit = "Financing(loans / credit)",
  Joint_Venture_partnership = "Joint Venture / Partnership",
  Exit = "Exit",
  M_A = "M-A",
  Sale = "Sale",
  LP_GP_Due_Diligence = "LP / GP Due Dilligence",
  Capital_Raise = "Capital Raise(Equality, Warrants-Others)",
}

export enum EWorkspaceType {
  Two_Way = "Two Way",
  One_Way = "One Way",
}

export enum EAzureFolder {
  User = "user",
  Workspace = "workspace",
}

export enum EWorkflowStatus {
  Pending = "Pending",
  In_Process = "In Process",
  Complete = "Complete",
}

export enum ELogsActivity {
  Login_History = "Login History",
  Document_Upload = "Document Upload",
  Participant_Add_Remove = "Participant Add Remove",
  Team_Add_Remove = "Team Add Remove",
  Q_A_Summary = "Q A Summary",
  Others_TBC = "Others TBC",
}

export enum EActivityStatus {
  Team_Created = "Team Created",
  Team_Update = "Team Updated",
  Team_Remove = "Team Removed",
  Participant_Created = "Participant Created",
  Participant_Remove = "Participant Removed",
  Question_Created = "Question Created",
  Question_Updated = "Question Updated",
  Question_Deleted = "Question Deleted",
  Answer_Submitted = "Answer Submitted",
  Document_Created = "Document Created",
  Document_Updated = "Document Updated",
}

export enum ERolesRole {
  Super_Admin = "Super Admin",
  Admin = "Admin",
  QA = "QA",
  Viewer = "Viewer",
}

type EnumTypes = {
  workspace: {
    purpose: EWorkspacePurpose[];
    type: EWorkspaceType[];
  };
  workflow: {
    status: EWorkflowStatus[];
  };
  logs: {
    activity: ELogsActivity[];
  };
  roles: {
    role: ERolesRole[];
  };
};

export const enums: EnumTypes = {
  workspace: {
    purpose: Object.values(EWorkspacePurpose),
    type: Object.values(EWorkspaceType),
  },
  workflow: {
    status: Object.values(EWorkflowStatus),
  },
  logs: {
    activity: Object.values(ELogsActivity),
  },
  roles: {
    role: Object.values(ERolesRole),
  },
};