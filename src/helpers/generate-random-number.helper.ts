export class Utils {
  public static async generateRandomNumber(userId: number, workspaceId: number, moduleId: number) {
    return `${userId}${workspaceId}${moduleId}`;
  }
}
