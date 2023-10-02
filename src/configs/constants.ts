export class Constants {
  public static readonly JOB_CONFIG = {
    failed: {
      age: 24 * 3600,
    },
    completed: {
      age: 1 * 3600,
      count: 100,
    },
  };

  public static readonly ENVIRONMENTS = ["development", "stage", "production"];

  public static readonly JWT_TOKEN_VERSION = "v1"; // Just increase to invalidate all sessions.

  public static readonly PAGER = {
    page: 1,
    limit: 2000,
  };
}
