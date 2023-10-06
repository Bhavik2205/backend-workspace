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

type EnumTypes = {
  workspace: {
    purpose: string[];
    type: string[];
  };
};

export const enums: EnumTypes = {
  workspace: {
    purpose: Object.values(EWorkspacePurpose),
    type: Object.values(EWorkspaceType),
  },
};
