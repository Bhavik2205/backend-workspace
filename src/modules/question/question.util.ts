export class Utils {
  public async generateRandomNumber(userId: number, workspaceId: number, moduleId: number) {
    return `${userId}${workspaceId}${moduleId}`;
  }
}
