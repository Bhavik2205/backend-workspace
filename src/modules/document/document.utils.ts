export class DocumentUtils {
  public async generateRandomNumber(userId: number, workspaceId: number, documentId: number) {
    return `${userId}${workspaceId}${documentId}`;
  }
}
