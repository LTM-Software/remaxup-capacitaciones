import S3 from "aws-sdk/clients/s3";

import { IStorageProvider } from "../interface";
import { CONFIG } from "../../storage/config";
import { convertFileToBuffer } from "../../../helpers/convert-file-to-buffer";

export class MinioStorageProvider implements IStorageProvider {
  client: S3;

  constructor() {
    this.client = new S3({
      endpoint: CONFIG.providers.storage.endpoint,
      apiVersion: "latest",
      region: CONFIG.providers.storage.region,
      accessKeyId: CONFIG.providers.storage.accessKeyId,
      secretAccessKey: CONFIG.providers.storage.secretAccessKey,
      signatureVersion:
        CONFIG.providers.storage.signatureVersion,
      s3ForcePathStyle: true,
    });
  }

  async upload(file: File): Promise<string> {
    const fileBuffer = await convertFileToBuffer(file);

    // Key única para evitar colisiones de nombre.
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const key = `${Date.now()}-${Math.round(
      Math.random() * 1e6
    )}-${safeName}`;

    const params = {
      Bucket: CONFIG.providers.storage.bucket as string,
      Key: key,
      Body: fileBuffer,
      ACL: "public-read",
      // Content-Type real para que el navegador pueda previsualizar
      // (PDF/imagen/video) o descargar según corresponda.
      ContentType: file.type || "application/octet-stream",
    };

    try {
      const { Location } = await this.client
        .upload(params)
        .promise();
      console.log("File uploaded successfully:", Location);
      return Location;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Error uploading file");
    }
  }

  async delete(path: string): Promise<void> {
    const params = {
      Bucket: CONFIG.providers.storage.bucket as string,
      Key: path,
    };

    try {
      await this.client.deleteObject(params).promise();
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error("Error deleting file");
    }
  }
}
