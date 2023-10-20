export class Utils {
  public static generateRandomNumber(userId: number, workspaceId: number, moduleId: number) {
    return `${userId}${workspaceId}${moduleId}`;
  }
}
