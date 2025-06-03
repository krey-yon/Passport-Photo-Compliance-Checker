"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function extractTextFromImage(
  imageDataUrl: string
): Promise<OCRResult> {
  try {
    const worker = await createWorker();

    // await worker.loadLanguage("eng");
    // await worker.initialize("eng");

    const {
      data: { text },
    } = await worker.recognize(imageDataUrl);
    await worker.terminate();

    if (!text || text.trim().length === 0) {
      return {
        success: true,
        data: {
          other: [],
          rawText: "No data found in image",
        },
      };
    }

    const extractedData = parseText(text);

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

function parseText(rawText: string): ExtractedTextData {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const extractedData: ExtractedTextData = {
    other: [],
    rawText: rawText,
  };

  const patterns = {
    name: /(?:name|given\s+name|surname)[:\s]*([a-zA-Z\s]+)/i,
    dateOfBirth:
      /(?:date\s+of\s+birth|dob|born)[:\s]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i,
    passportNumber: /(?:passport\s+no|passport\s+number)[:\s]*([A-Z0-9]+)/i,
    nationality: /(?:nationality|country)[:\s]*([a-zA-Z\s]+)/i,
  };

  for (const [field, pattern] of Object.entries(patterns)) {
    const match = rawText.match(pattern);
    if (match && match[1] && field !== "other") {
      // Only assign to fields that are not 'other'
      (extractedData as any)[field] = match[1].trim();
    }
  }

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
    .slice(0, 5);

  return extractedData;
}
