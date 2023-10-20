import { StorageSharedKeyCredential, BlobServiceClient, ContainerClient, BlockBlobClient } from "@azure/storage-blob";
import { env } from "@configs";

export class AzureUtils {
  private static sharedKeyCredential: StorageSharedKeyCredential;

  private static blobServiceClient: BlobServiceClient;

  static initialize(): void {
    const account = env.azureStorageAccountName;
    const accountKey = env.azureStorageAccountKey;

    this.sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    this.blobServiceClient = new BlobServiceClient(env.azureURL, this.sharedKeyCredential);
  }

  static getContainerClient(containerName: string): ContainerClient {
    return this.blobServiceClient.getContainerClient(containerName);
  }

  static getBlockBlobClient(blobName: string, containerClient: ContainerClient): BlockBlobClient {
    return containerClient.getBlockBlobClient(blobName);
  }
}
