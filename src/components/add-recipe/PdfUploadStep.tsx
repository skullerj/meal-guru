import { type DragEvent, useRef } from "react";
import Button from "../shared/Button";
import Icon from "../shared/Icon";

interface PdfUploadStepProps {
  uploadedFile: File | null;
  isLoading: boolean;
  onFileUpload: (file: File) => void;
  onParsePdf: () => void;
}

export default function PdfUploadStep({
  uploadedFile,
  isLoading,
  onFileUpload,
  onParsePdf,
}: PdfUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      onFileUpload(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This element needs to handle the drop and drag over to allow file dropping
    <div
      className="bg-white p-6 rounded-lg shadow-md mb-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h2 className="text-xl font-semibold mb-4">Upload Recipe PDF</h2>

      <button
        type="button"
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer w-full"
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {uploadedFile ? (
          <div className="flex items-center justify-center" role="alert">
            <Icon
              name="check-circle"
              size="md"
              className="text-green-500 mr-2"
              aria-label="File uploaded successfully"
            />
            <span className="text-sm text-gray-600">{uploadedFile.name}</span>
          </div>
        ) : (
          <>
            <Icon
              name="upload"
              size="xl"
              className="mx-auto text-gray-400"
              aria-label="Upload file"
            />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF files only</p>
          </>
        )}
      </button>

      <Button
        onClick={onParsePdf}
        disabled={!uploadedFile}
        loading={isLoading}
        className="mt-4 w-full"
      >
        {isLoading ? "Parsing with AI..." : "Parse Recipe"}
      </Button>
    </div>
  );
}
