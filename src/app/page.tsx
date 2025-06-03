"use client";

import { useState, useCallback } from "react";
import { Upload, Camera, Globe, CheckCircle } from "lucide-react";
import ImageUploader from "@/components/image-uploader";
import CountrySelector from "@/components/country-selector";
import ComplianceResults from "@/components/compliance-results";
// import { analyzePassportPhoto } from "@/lib/photo-analyzer";
import { extractTextFromImage } from "@/lib/ocr-client"; // Changed import
import { analyzePassportWithFacePlusPlus } from "@/actions/index";
import type { ComplianceResult, Country } from "@/types";
import { analyzePassportWithGemini } from "@/actions/llm";

export default function PassportChecker() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = useCallback((imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setComplianceResult(null);

    // Store in localStorage temporarily
    localStorage.setItem("passport_photo_temp", imageDataUrl);
  }, []);

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setComplianceResult(null);
  }, []);

  const analyzePhoto = useCallback(async () => {
    if (!selectedImage || !selectedCountry) return;

    setIsAnalyzing(true);

    try {
      // Call OCR analysis (now client-side)
      console.log("Starting OCR analysis...");
      const ocrResult = await extractTextFromImage(selectedImage);
      console.log("OCR Result:", ocrResult);

      // Call Face++ analysis (server-side)
      console.log("Starting Face++ analysis...");
      const faceAnalysisResult = await analyzePassportWithFacePlusPlus(
        selectedImage
      );
      console.log("Face++ Result:", faceAnalysisResult);

      console.log({
        "OCR Result:": ocrResult,
        "Face++ Result:": faceAnalysisResult,
      });

      const analysisdata = {
        "OCR Result:": ocrResult,
        "Face++ Result:": faceAnalysisResult,
      };
      const geminiResult = await analyzePassportWithGemini(
        analysisdata,
        selectedCountry
      );
      console.log(geminiResult);

      // Log results
      if (ocrResult.success && ocrResult.data) {
        console.log("OCR extracted data:", {
          name: ocrResult.data.name || "Not found",
          dateOfBirth: ocrResult.data.dateOfBirth || "Not found",
          passportNumber: ocrResult.data.passportNumber || "Not found",
          nationality: ocrResult.data.nationality || "Not found",
          other: ocrResult.data.other,
        });
      }

      console.log("ocr and face analyze result", {
        ocrResult,
        faceAnalysisResult,
      });

      if ("error" in faceAnalysisResult) {
        console.log("Face++ analysis failed:", faceAnalysisResult.error);
      } else {
        console.log("Face++ analysis successful:", {
          faceDetected: faceAnalysisResult.faceDetection.faceDetected,
          faceCount: faceAnalysisResult.faceDetection.faceCount,
          headPosition: faceAnalysisResult.headPosition,
          expression: faceAnalysisResult.expression.dominantEmotion,
          imageQuality: faceAnalysisResult.imageQuality.overallQuality?.value,
        });
      }

      if (geminiResult && !("error" in geminiResult)) {
        const complianceResult: ComplianceResult = {
          overallScore: geminiResult.overallScore,
          checks: geminiResult.checks,
          recommendations: geminiResult.recommendations || [],
          countrySpecificNotes: geminiResult.countrySpecificNotes || [],
        };
        setComplianceResult(complianceResult);
      } else {
        console.error("Gemini analysis failed:", geminiResult?.error);
        // Fall back to original analyzer
        // const result = analyzePassportPhoto(selectedImage, selectedCountry);
        // setComplianceResult(result);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage, selectedCountry]);

  const resetChecker = useCallback(() => {
    setSelectedImage(null);
    setSelectedCountry(null);
    setComplianceResult(null);
    localStorage.removeItem("passport_photo_temp");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Passport Photo Compliance Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ensure your passport photo meets official requirements for any
            country. Get instant feedback and suggestions for improvement.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Country Selection */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="w-6 h-6 mr-3 text-blue-600" />
                  Upload Your Photo
                </h2>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  selectedImage={selectedImage}
                />
              </div>

              {/* Country Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-green-600" />
                  Select Country
                </h2>
                <CountrySelector
                  onCountrySelect={handleCountrySelect}
                  selectedCountry={selectedCountry}
                />
              </div>

              {/* Analyze Button */}
              {selectedImage && selectedCountry && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <button
                    onClick={analyzePhoto}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing Photo...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Check Compliance
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {complianceResult ? (
                <ComplianceResults
                  result={complianceResult}
                  country={selectedCountry!}
                  onReset={resetChecker}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Ready to Check Compliance
                  </h3>
                  <p className="text-gray-600">
                    Upload your passport photo and select a country to get
                    started with the compliance check.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
            <p className="text-gray-600 text-sm">
              Drag & drop, paste, or browse to upload your photo
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Global Standards
            </h3>
            <p className="text-gray-600 text-sm">
              Check compliance for multiple countries
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Instant Results
            </h3>
            <p className="text-gray-600 text-sm">
              Get detailed feedback and improvement suggestions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
