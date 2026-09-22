"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  File,
  FileText,
  Folder,
  FolderPlus,
  Grid2X2,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import {
  type ChangeEvent,
  type DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";

type DocumentStatus = "Uploaded" | "Uploading" | "Failed";

type KnowledgeDocument = {
  id: string;
  name: string;
  type: string;
  size: string;
  collection: string;
  status: DocumentStatus;
};

type Collection = {
  id: number;
  name: string;
  color: string;
};

type UploadApiResponse = {
  success: boolean;
  message?: string;
  document?: {
    id: string;
    originalName: string;
    storedFileName: string;
    type: string;
    mimeType: string;
    size: number;
    status: string;
  };
};

const collections: Collection[] = [
  {
    id: 1,
    name: "Azure",
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    name: "SQL",
    color: "bg-violet-50 text-violet-600",
  },
  {
    id: 3,
    name: "Programming",
    color: "bg-orange-50 text-orange-600",
  },
];

const supportedExtensions = ["pdf", "docx", "txt"];

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 KB";
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(1)} MB`;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getFileType(fileName: string) {
  const extension = getFileExtension(fileName);

  if (!extension) {
    return "FILE";
  }

  return extension.toUpperCase();
}

export default function KnowledgePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = document.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCollection =
        selectedCollection === "All" ||
        document.collection === selectedCollection;

      return matchesSearch && matchesCollection;
    });
  }, [documents, searchQuery, selectedCollection]);

  const uploadedCount = documents.filter(
    (document) => document.status === "Uploaded",
  ).length;

  async function uploadFile(
    file: globalThis.File,
    collectionName: string,
  ) {
    const temporaryId = crypto.randomUUID();

    const temporaryDocument: KnowledgeDocument = {
      id: temporaryId,
      name: file.name,
      type: getFileType(file.name),
      size: formatBytes(file.size),
      collection: collectionName,
      status: "Uploading",
    };

    setDocuments((currentDocuments) => [
      temporaryDocument,
      ...currentDocuments,
    ]);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadApiResponse;

      if (!response.ok || !result.success || !result.document) {
        throw new Error(
          result.message ?? `Upload failed with status ${response.status}.`,
        );
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) => {
          if (document.id !== temporaryId) {
            return document;
          }

          return {
            id: result.document!.id,
            name: result.document!.originalName,
            type: result.document!.type,
            size: formatBytes(result.document!.size),
            collection: collectionName,
            status: "Uploaded",
          };
        }),
      );

      return true;
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === temporaryId
            ? {
                ...document,
                status: "Failed",
              }
            : document,
        ),
      );

      return false;
    }
  }

  async function addFiles(files: globalThis.File[]) {
    setUploadMessage("");
    setUploadError("");

    const supportedFiles = files.filter((file) => {
      const extension = getFileExtension(file.name);

      return supportedExtensions.includes(extension);
    });

    const unsupportedCount = files.length - supportedFiles.length;

    if (supportedFiles.length === 0) {
      setUploadError(
        "No supported files were selected. Please choose PDF, DOCX, or TXT files.",
      );

      return;
    }

    const collectionName =
      selectedCollection === "All"
        ? "Uncategorized"
        : selectedCollection;

    setIsUploading(true);

    let successfulUploads = 0;

    for (const file of supportedFiles) {
      const success = await uploadFile(file, collectionName);

      if (success) {
        successfulUploads += 1;
      }
    }

    setIsUploading(false);

    if (successfulUploads > 0) {
      setUploadMessage(
        `${successfulUploads} document${
          successfulUploads === 1 ? "" : "s"
        } uploaded successfully.`,
      );
    }

    if (successfulUploads !== supportedFiles.length) {
      setUploadError(
        "One or more documents could not be uploaded. Check the failed document status below.",
      );
    } else if (unsupportedCount > 0) {
      setUploadError(
        `${unsupportedCount} unsupported file${
          unsupportedCount === 1 ? " was" : "s were"
        } skipped.`,
      );
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      await addFiles(files);
    }

    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setIsDragging(false);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);

    if (files.length > 0) {
      await addFiles(files);
    }
  }

  function removeDocument(id: string) {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== id),
    );
  }

  function getCollectionDocumentCount(collectionName: string) {
    return documents.filter(
      (document) =>
        document.collection === collectionName &&
        document.status === "Uploaded",
    ).length;
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCollection("All");
  }

  function renderStatus(status: DocumentStatus) {
    if (status === "Uploaded") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <Check size={13} />
          Uploaded
        </span>
      );
    }

    if (status === "Uploading") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          Uploading
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <X size={13} />
        Failed
      </span>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
      {/* HEADER */}

      <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            <Sparkles size={15} />
            Personal Knowledge Base
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Knowledge Library
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Upload and organize the knowledge that will power your future
            OtherME conversations, study tools, and RAG retrieval.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} />

          {isUploading ? "Uploading..." : "Add Knowledge"}
        </button>
      </section>

      {/* STATS */}

      <section className="mb-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <FileText size={20} />
            </div>

            <span className="text-2xl font-bold text-zinc-900">
              {documents.length}
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold text-zinc-800">
            Documents
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Documents in this session
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Folder size={20} />
            </div>

            <span className="text-2xl font-bold text-zinc-900">
              {collections.length}
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold text-zinc-800">
            Collections
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Organize related knowledge
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Check size={20} />
            </div>

            <span className="text-2xl font-bold text-zinc-900">
              {uploadedCount}
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold text-zinc-800">
            Uploaded
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            RAG indexing comes next
          </p>
        </div>
      </section>

      {/* UPLOAD AREA */}

      <section className="mb-9">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition md:p-10 ${
            isDragging
              ? "border-violet-500 bg-violet-50"
              : "border-zinc-200 bg-white hover:border-violet-300"
          }`}
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600">
            <Upload size={25} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            {isUploading
              ? "Uploading your knowledge..."
              : "Add knowledge to OtherME"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Drag and drop documents here, or choose files from your computer.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-5 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-violet-300 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Choose files"}
          </button>

          <p className="mt-4 text-xs text-zinc-400">
            PDF, DOCX and TXT • Maximum 10 MB per file
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* UPLOAD MESSAGES */}

        {uploadMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <Check size={16} />
            {uploadMessage}
          </div>
        )}

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <X size={16} />
            {uploadError}
          </div>
        )}
      </section>

      {/* COLLECTIONS */}

      <section className="mb-9">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Collections
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Keep related knowledge together.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            <FolderPlus size={16} />
            New collection
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <button
              type="button"
              key={collection.id}
              onClick={() => setSelectedCollection(collection.name)}
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedCollection === collection.name
                  ? "border-violet-400 ring-4 ring-violet-50"
                  : "border-zinc-200"
              }`}
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${collection.color}`}
              >
                <Folder size={19} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                {collection.name}
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                {getCollectionDocumentCount(collection.name)} documents
              </p>
            </button>
          ))}

          <button
            type="button"
            className="flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-5 text-center transition hover:border-violet-300 hover:bg-violet-50/30"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-500">
              <Plus size={19} />
            </div>

            <span className="mt-3 text-sm font-semibold text-zinc-700">
              New collection
            </span>
          </button>
        </div>
      </section>

      {/* DOCUMENT HEADER */}

      <section>
        <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Your Documents
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Manage your uploaded knowledge.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* SEARCH */}

            <div className="flex h-10 min-w-64 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3">
              <Search size={16} className="text-zinc-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search documents..."
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* COLLECTION FILTER */}

            <div className="relative">
              <select
                value={selectedCollection}
                onChange={(event) =>
                  setSelectedCollection(event.target.value)
                }
                className="h-10 min-w-40 appearance-none rounded-xl border border-zinc-200 bg-white pl-3 pr-9 text-sm text-zinc-700 outline-none focus:border-violet-400"
              >
                <option value="All">All collections</option>

                {collections.map((collection) => (
                  <option
                    key={collection.id}
                    value={collection.name}
                  >
                    {collection.name}
                  </option>
                ))}

                <option value="Uncategorized">
                  Uncategorized
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>

            {/* VIEW MODE */}

            <div className="flex h-10 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`grid w-10 place-items-center transition ${
                  viewMode === "list"
                    ? "bg-violet-50 text-violet-600"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <List size={17} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`grid w-10 place-items-center transition ${
                  viewMode === "grid"
                    ? "bg-violet-50 text-violet-600"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <Grid2X2 size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}

        {filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-50 text-zinc-400">
              <BookOpen size={25} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-zinc-900">
              {documents.length === 0
                ? "Your knowledge base is empty"
                : "No matching documents"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
              {documents.length === 0
                ? "Upload your first PDF, DOCX, or TXT document to begin building your personal OtherME knowledge base."
                : "Try another search term or select a different collection."}
            </p>

            {documents.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                <Upload size={16} />
                Upload first document
              </button>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:border-violet-300"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* LIST VIEW */

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {filteredDocuments.map((document, index) => (
              <div
                key={document.id}
                className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${
                  index !== filteredDocuments.length - 1
                    ? "border-b border-zinc-100"
                    : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {document.name}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span>{document.type}</span>
                      <span>•</span>
                      <span>{document.size}</span>
                      <span>•</span>
                      <span>{document.collection}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  {renderStatus(document.status)}

                  <button
                    type="button"
                    onClick={() =>
                      removeDocument(document.id)
                    }
                    aria-label={`Remove ${document.name}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <X size={17} />
                  </button>

                  <button
                    type="button"
                    aria-label={`More options for ${document.name}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GRID VIEW */

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <article
                key={document.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-500">
                    <File size={20} />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeDocument(document.id)
                    }
                    aria-label={`Remove ${document.name}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                <h3 className="mt-4 truncate text-sm font-semibold text-zinc-900">
                  {document.name}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {document.type} • {document.size}
                </p>

                <div className="mt-4">
                  <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                    {document.collection}
                  </span>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-4">
                  {renderStatus(document.status)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DEVELOPMENT STATUS */}

      <section className="mt-7 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
        <div className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-violet-600">
            <Sparkles size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              OtherME RAG Pipeline
            </h3>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Documents can now be sent to the OtherME upload API. An
              &quot;Uploaded&quot; status means the server accepted the file.
              It does not yet mean the document has been parsed, embedded, or
              indexed for RAG.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-emerald-700">
                Upload
              </span>

              <span className="text-zinc-400">→</span>

              <span className="rounded-lg bg-white px-2.5 py-1.5 text-zinc-500">
                Extract
              </span>

              <span className="text-zinc-400">→</span>

              <span className="rounded-lg bg-white px-2.5 py-1.5 text-zinc-500">
                Chunk
              </span>

              <span className="text-zinc-400">→</span>

              <span className="rounded-lg bg-white px-2.5 py-1.5 text-zinc-500">
                Embed
              </span>

              <span className="text-zinc-400">→</span>

              <span className="rounded-lg bg-white px-2.5 py-1.5 text-zinc-500">
                Index
              </span>

              <span className="text-zinc-400">→</span>

              <span className="rounded-lg bg-white px-2.5 py-1.5 text-zinc-500">
                Ask AI
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}