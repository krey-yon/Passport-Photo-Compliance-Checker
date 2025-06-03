/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createWorker } from "tesseract.js";

interface ExtractedTextData {
  name?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  nationality?: string;
  other: string[];
  rawText: string;
}

interface OCRResult {
  success: boolean;
  data?: ExtractedTextData;
  error?: string;
}

// Accept multiple input types
export async function extractTextFromImage(
  imageInput: string | File | Buffer
): Promise<OCRResult> {
  try {
    // Create and configure Tesseract worker
    const worker = await createWorker();
    // await worker.loadLanguage("eng");
    // await worker.initialize("eng");

    // Perform OCR - Tesseract can handle File, Buffer, or data URL directly
    const {
      data: { text },
    } = await worker.recognize(imageInput);
    await worker.terminate();

    // Check if any text was found
    if (!text || text.trim().length === 0) {
      return {
        success: true,
        data: {
          other: [],
          rawText: "No data found in image",
        },
      };
    }

    // Parse the text
    const extractedData = parseText(text);

    // Check if we found any meaningful data
    const hasData =
      extractedData.name ||
      extractedData.dateOfBirth ||
      extractedData.passportNumber ||
      extractedData.nationality ||
      extractedData.other.length > 0;

    if (!hasData) {
      return {
        success: true,
        data: {
          other: [],
          rawText: "No data found in image",
        },
      };
    }

    return {
      success: true,
      data: extractedData,
    };
  } catch (error) {
    console.error("OCR Error:", error);
    return {
      success: false,
      error: "Failed to scan image",
    };
  }
}

// Alternative function specifically for FormData
export async function extractTextFromFormData(
  formData: FormData
): Promise<OCRResult> {
  try {
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return {
        success: false,
        error: "No image file found in FormData",
      };
    }

    // Use the File directly with Tesseract
    return await extractTextFromImage(imageFile);
  } catch (error) {
    console.error("FormData OCR Error:", error);
    return {
      success: false,
      error: "Failed to process FormData",
    };
  }
}

// Alternative function for Buffer (if you convert File to Buffer)
export async function extractTextFromBuffer(
  imageBuffer: Buffer
): Promise<OCRResult> {
  return await extractTextFromImage(imageBuffer);
}

function parseText(rawText: string): ExtractedTextData {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const extractedData: ExtractedTextData = {
    other: [],
    rawText: rawText,
  };

  // Simple patterns for common fields
  const patterns = {
    name: /(?:name|given\s+name|surname)[:\s]*([a-zA-Z\s]+)/i,
    dateOfBirth:
      /(?:date\s+of\s+birth|dob|born)[:\s]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i,
    passportNumber: /(?:passport\s+no|passport\s+number)[:\s]*([A-Z0-9]+)/i,
    nationality: /(?:nationality|country)[:\s]*([a-zA-Z\s]+)/i,
  };

  // Extract data using patterns
  for (const [field, pattern] of Object.entries(patterns)) {
    const match = rawText.match(pattern);
    if (match && match[1] && field !== "other") {
      // Only assign to fields that are not 'other'
      (extractedData as any)[field] = match[1].trim();
    }
  }

  // If no name found, look for all caps lines (common in passports)
  if (!extractedData.name) {
    const capsLine = lines.find(
      (line) =>
        /^[A-Z\s]+$/.test(line) &&
        line.length > 3 &&
        line.length < 40 &&
        !line.includes("PASSPORT") &&
        !line.includes("REPUBLIC")
    );
    if (capsLine) {
      extractedData.name = capsLine.trim();
    }
  }

  // Collect remaining lines as other data
  const usedValues = [
    extractedData.name?.toLowerCase(),
    extractedData.dateOfBirth?.toLowerCase(),
    extractedData.passportNumber?.toLowerCase(),
    extractedData.nationality?.toLowerCase(),
  ].filter(Boolean);

  extractedData.other = lines
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        !usedValues.some((used) => used && lower.includes(used)) &&
        line.length > 2
      );
    })
    .slice(0, 5); // Keep only first 5 other lines

  return extractedData;
}
