"use client";

import {
  CheckCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
  Info,
  Flag,
} from "lucide-react";
import type { ComplianceResult, Country } from "@/types";

interface ComplianceResultsProps {
  result: ComplianceResult;
  country: Country;
  onReset: () => void;
}

export default function ComplianceResults({
  result,
  country,
  onReset,
}: ComplianceResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const getStatusIcon = (status: "pass" | "warning" | "fail") => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  // Calculate check statistics
  const passedChecks = result.checks.filter(
    (check) => check.status === "pass"
  ).length;
  const warningChecks = result.checks.filter(
    (check) => check.status === "warning"
  ).length;
  const failedChecks = result.checks.filter(
    (check) => check.status === "fail"
  ).length;
  const totalChecks = result.checks.length;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-3">{country.flag}</span>
            <h2 className="text-2xl font-bold text-gray-900">
              {country.name} Compliance
            </h2>
          </div>

          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(result.overallScore / 100) * 314} 314`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    offset="0%"
                    className={`${getScoreBackground(result.overallScore)
                      .split(" ")[0]
                      .replace("from-", "stop-")}`}
                  />
                  <stop
                    offset="100%"
                    className={`${getScoreBackground(result.overallScore)
                      .split(" ")[1]
                      .replace("to-", "stop-")}`}
                  />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-3xl font-bold ${getScoreColor(
                  result.overallScore
                )}`}
              >
                {Math.round(result.overallScore)}%
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-4">
            {result.overallScore >= 80
              ? "Excellent compliance!"
              : result.overallScore >= 60
              ? "Good compliance with minor issues"
              : "Needs improvement"}
          </p>

          {/* Check Statistics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-semibold text-green-800">{passedChecks}</div>
              <div className="text-green-600">Passed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="font-semibold text-yellow-800">
                {warningChecks}
              </div>
              <div className="text-yellow-600">Warnings</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="font-semibold text-red-800">{failedChecks}</div>
              <div className="text-red-600">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Detailed Analysis ({passedChecks}/{totalChecks} checks passed)
        </h3>

        <div className="space-y-4">
          {result.checks.map((check, index) => (
            <div
              key={index}
              className="flex items-start p-4 bg-gray-50 rounded-xl"
            >
              <div className="mr-3 mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {check.category}
                </h4>

                {/* Dynamic message based on status */}
                <p className="text-gray-600 text-sm mb-2">
                  {check.status === "pass" && check.message}
                  {check.status === "warning" &&
                    (check.warningMessage || check.message)}
                  {check.status === "fail" &&
                    (check.failMessage || check.message)}
                </p>

                {/* Show suggestion if it's not "No issues found." */}
                {check.suggestion &&
                  check.suggestion !== "No issues found." && (
                    <p className="text-blue-600 text-sm font-medium">
                      💡 {check.suggestion}
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Recommendations
          </h3>

          <div className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-blue-800 text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country-Specific Notes */}
      {result.countrySpecificNotes &&
        result.countrySpecificNotes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Flag className="w-5 h-5 mr-2 text-purple-600" />
              {country.name} Specific Requirements
            </h3>

            <div className="space-y-3">
              {result.countrySpecificNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-purple-800 text-sm">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onReset}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Check Another Photo
          </button>

          <button
            onClick={() => window.print()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Save Results
          </button>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium">Summary:</span> {passedChecks} checks
            passed, {warningChecks} warnings, {failedChecks} failed out of{" "}
            {totalChecks} total checks
          </p>
        </div>
      </div>
    </div>
  );
}
