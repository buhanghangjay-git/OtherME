import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedExtensions = ["pdf", "docx", "txt"];

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
];

type ExtractionResult = {
  status: "Completed" | "Pending";
  textFileName: string | null;
  characterCount: number;
  wordCount: number;
  preview: string | null;
};

function sanitizeFileName(fileName: string) {
  const cleanedName = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleanedName || "document";
}

function getFileExtension(fileName: string) {
  return path.extname(fileName).replace(".", "").toLowerCase();
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
}

function countWords(text: string) {
  if (!text.trim()) {
    return 0;
  }

  return text.trim().split(/\s+/).filter(Boolean).length;
}

function createPreview(text: string, maximumLength = 300) {
  const singleLineText = text.replace(/\s+/g, " ").trim();

  if (singleLineText.length <= maximumLength) {
    return singleLineText;
  }

  return `${singleLineText.slice(0, maximumLength).trim()}...`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
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

    if (uploadedFile.size === 0) {
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

    if (uploadedFile.size > MAX_FILE_SIZE) {
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

    const extension = getFileExtension(uploadedFile.name);

    if (!allowedExtensions.includes(extension)) {
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

    if (
      uploadedFile.type &&
      !allowedMimeTypes.includes(uploadedFile.type)
    ) {
      return Response.json(
        {
          success: false,
          message: `Unsupported MIME type: ${uploadedFile.type}`,
        },
        {
          status: 400,
        },
      );
    }

    const documentId = randomUUID();
    const safeOriginalName = sanitizeFileName(uploadedFile.name);
    const storedFileName = `${documentId}-${safeOriginalName}`;

    const storageDirectory = path.join(process.cwd(), "storage");
    const documentsDirectory = path.join(
      storageDirectory,
      "documents",
    );
    const extractedTextDirectory = path.join(
      storageDirectory,
      "extracted",
    );
    const metadataDirectory = path.join(
      storageDirectory,
      "metadata",
    );

    await Promise.all([
      mkdir(documentsDirectory, {
        recursive: true,
      }),
      mkdir(extractedTextDirectory, {
        recursive: true,
      }),
      mkdir(metadataDirectory, {
        recursive: true,
      }),
    ]);

    const fileBytes = await uploadedFile.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    const storedFilePath = path.join(
      documentsDirectory,
      storedFileName,
    );

    await writeFile(storedFilePath, fileBuffer);

    let extraction: ExtractionResult = {
      status: "Pending",
      textFileName: null,
      characterCount: 0,
      wordCount: 0,
      preview: null,
    };

    if (extension === "txt") {
      const rawText = fileBuffer.toString("utf8");
      const extractedText = normalizeExtractedText(rawText);

      if (!extractedText) {
        return Response.json(
          {
            success: false,
            message:
              "The TXT document was uploaded, but no readable text was found.",
          },
          {
            status: 422,
          },
        );
      }

      const extractedTextFileName = `${documentId}.txt`;

      const extractedTextPath = path.join(
        extractedTextDirectory,
        extractedTextFileName,
      );

      await writeFile(
        extractedTextPath,
        extractedText,
        "utf8",
      );

      extraction = {
        status: "Completed",
        textFileName: extractedTextFileName,
        characterCount: extractedText.length,
        wordCount: countWords(extractedText),
        preview: createPreview(extractedText),
      };
    }

    const documentStatus =
      extraction.status === "Completed"
        ? "Extracted"
        : "Uploaded";

    const documentMetadata = {
      id: documentId,
      originalName: uploadedFile.name,
      storedFileName,
      type: extension.toUpperCase(),
      mimeType: uploadedFile.type || "unknown",
      size: uploadedFile.size,
      status: documentStatus,
      extraction,
      createdAt: new Date().toISOString(),
    };

    const metadataFilePath = path.join(
      metadataDirectory,
      `${documentId}.json`,
    );

    await writeFile(
      metadataFilePath,
      JSON.stringify(documentMetadata, null, 2),
      "utf8",
    );

    return Response.json(
      {
        success: true,
        message:
          extraction.status === "Completed"
            ? "Document uploaded and text extracted successfully."
            : "Document uploaded successfully. Text extraction is pending.",
        document: documentMetadata,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("OtherME document processing failed:", error);

    return Response.json(
      {
        success: false,
        message:
          "The document could not be uploaded or processed.",
      },
      {
        status: 500,
      },
    );
  }
}