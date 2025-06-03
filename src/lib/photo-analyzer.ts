// import type { ComplianceResult, Country, ComplianceCheck } from "@/types"

// export function analyzePassportPhoto(imageDataUrl: string, country: Country): ComplianceResult {
//   // This is a mock analysis function. In a real application, you would use
//   // computer vision APIs or machine learning models to analyze the image.

//   const checks: ComplianceCheck[] = []
//   const recommendations: string[] = []

//   // Simulate various compliance checks
//   const mockChecks = [
//     {
//       category: "Face Detection",
//       status: Math.random() > 0.2 ? "pass" : ("fail" as const),
//       message: "Face detected and properly positioned",
//       failMessage: "Face not clearly detected or positioned incorrectly",
//       suggestion: "Ensure your face is clearly visible and centered in the photo",
//     },
//     {
//       category: "Background",
//       status: Math.random() > 0.3 ? "pass" : ("warning" as const),
//       message: "Background appears to be plain and light-colored",
//       warningMessage: "Background could be more uniform",
//       suggestion: "Use a plain white or light gray background",
//     },
//     {
//       category: "Image Quality",
//       status: Math.random() > 0.25 ? "pass" : ("warning" as const),
//       message: "Image quality is acceptable",
//       warningMessage: "Image could be sharper or higher resolution",
//       suggestion: "Use a higher resolution camera or better lighting",
//     },
//     {
//       category: "Face Size",
//       status: Math.random() > 0.35 ? "pass" : ("fail" as const),
//       message: "Face size is within acceptable range (70-80% of image height)",
//       failMessage: "Face is too small or too large in the frame",
//       suggestion: "Adjust distance from camera so face occupies 70-80% of image height",
//     },
//     {
//       category: "Eye Level",
//       status: Math.random() > 0.4 ? "pass" : ("warning" as const),
//       message: "Eyes are properly positioned and level",
//       warningMessage: "Eye level could be more centered",
//       suggestion: "Position camera at eye level and look directly at the lens",
//     },
//     {
//       category: "Lighting",
//       status: Math.random() > 0.3 ? "pass" : ("warning" as const),
//       message: "Lighting appears even with no harsh shadows",
//       warningMessage: "Some shadows detected on face",
//       suggestion: "Use soft, even lighting from the front to avoid shadows",
//     },
//     {
//       category: "Expression",
//       status: Math.random() > 0.15 ? "pass" : ("warning" as const),
//       message: "Neutral expression with mouth closed",
//       warningMessage: "Expression should be more neutral",
//       suggestion: "Maintain a neutral expression with mouth closed and eyes open",
//     },
//     {
//       category: "Head Position",
//       status: Math.random() > 0.25 ? "pass" : ("fail" as const),
//       message: "Head is straight and facing forward",
//       failMessage: "Head appears tilted or not facing directly forward",
//       suggestion: "Keep head straight and face the camera directly",
//     },
//   ]

//   // Process each check
//   mockChecks.forEach((check) => {
//     if (check.status === "pass") {
//       checks.push({
//         category: check.category,
//         status: "pass",
//         message: check.message,
//         suggestion: undefined,
//       })
//     } else if (check.status === "warning") {
//       checks.push({
//         category: check.category,
//         status: "warning",
//         message: check.warningMessage || check.message,
//         suggestion: check.suggestion,
//       })
//       recommendations.push(check.suggestion)
//     } else {
//       checks.push({
//         category: check.category,
//         status: "fail",
//         message: check.failMessage || check.message,
//         suggestion: check.suggestion,
//       })
//       recommendations.push(check.suggestion)
//     }
//   })

//   // Calculate overall score
//   const passCount = checks.filter((c) => c.status === "pass").length
//   const warningCount = checks.filter((c) => c.status === "warning").length
//   const failCount = checks.filter((c) => c.status === "fail").length

//   const overallScore = Math.round((passCount * 100 + warningCount * 70 + failCount * 30) / checks.length)

//   // Add country-specific recommendations
//   const countrySpecificRecommendations = getCountrySpecificRecommendations(country)
//   recommendations.push(...countrySpecificRecommendations)

//   return {
//     overallScore,
//     checks,
//     recommendations: [...new Set(recommendations)], // Remove duplicates
//   }
// }

// function getCountrySpecificRecommendations(country: Country): string[] {
//   const recommendations: { [key: string]: string[] } = {
//     US: [
//       "Ensure photo is 2x2 inches (51x51mm) when printed",
//       "Photo should be taken within the last 6 months",
//       "Glasses are generally not recommended unless medically necessary",
//     ],
//     UK: [
//       "Photo must be 45mm wide and 35mm high",
//       "Photo should be taken against a light grey or cream background",
//       "No smiling - maintain a neutral expression",
//     ],
//     CA: [
//       "Photo size should be 50mm x 70mm",
//       "Ensure there is no red-eye effect",
//       "Photo must be taken by a commercial photographer",
//     ],
//     AU: [
//       "Photo must be 45mm x 35mm",
//       "Background should be plain white or light colored",
//       "Photo must be less than 6 months old",
//     ],
//     DE: [
//       "Photo must be 35mm x 45mm in size",
//       "Background must be neutral and light colored",
//       "Direct eye contact with camera is required",
//     ],
//   }

//   return (
//     recommendations[country.code] || [
//       "Check your country's specific passport photo requirements",
//       "Ensure photo meets international standards for passport photos",
//       "Consider having photo taken by a professional photographer",
//     ]
//   )
// }
