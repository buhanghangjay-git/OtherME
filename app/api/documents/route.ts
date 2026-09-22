import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const allowedExtensions = ["pdf", "docx", "txt"];

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "No valid file was provided.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size === 0) {
      return Response.json(
        {
          success: false,
          message: "The selected file is empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          success: false,
          message: "File size must be 10 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      return Response.json(
        {
          success: false,
          message: "Only PDF, DOCX, and TXT files are supported.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return Response.json(
        {
          success: false,
          message: "The file type is not supported.",
        },
        {
          status: 400,
        },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDirectory = path.join(
      process.cwd(),
      "storage",
      "documents",
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const safeOriginalName = sanitizeFileName(file.name);

    const storedFileName = `${randomUUID()}-${safeOriginalName}`;

    const filePath = path.join(
      uploadDirectory,
      storedFileName,
    );

    await writeFile(filePath, buffer);

    return Response.json(
      {
        success: true,
        message: "Document uploaded successfully.",
        document: {
          id: randomUUID(),
          originalName: file.name,
          storedFileName,
          type: extension.toUpperCase(),
          mimeType: file.type || "unknown",
          size: file.size,
          status: "Uploaded",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Document upload failed:", error);

    return Response.json(
      {
        success: false,
        message: "The document could not be uploaded.",
      },
      {
        status: 500,
      },
    );
  }
}