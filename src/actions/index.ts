"use server";

// import { Country } from "@/types";

interface FacePlusPlusAttributes {
  age?: { value: number };
  gender?: { value: string };
  emotion?: {
    anger: number;
    disgust: number;
    fear: number;
    happiness: number;
    neutral: number;
    sadness: number;
    surprise: number;
  };
  eyestatus?: {
    left_eye_status: {
      normal: number;
      occlusion: number;
      no_glass_eye_open: number;
      no_glass_eye_close: number;
    };
    right_eye_status: {
      normal: number;
      occlusion: number;
      no_glass_eye_open: number;
      no_glass_eye_close: number;
    };
  };
  facequality?: {
    threshold: number;
    value: number;
  };
  blur?: {
    blurness: { threshold: number; value: number };
    motionblur: { threshold: number; value: number };
    gaussianblur: { threshold: number; value: number };
  };
  headpose?: {
    pitch_angle: number;
    roll_angle: number;
    yaw_angle: number;
  };
  smile?: { threshold: number; value: number };
  glass?: { value: string };
  skinstatus?: {
    health: number;
    stain: number;
    acne: number;
    dark_circle: number;
  };
}

interface FacePlusPlusLandmark {
  [key: string]: { x: number; y: number };
}

interface FacePlusPlusFace {
  face_token: string;
  face_rectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  attributes?: FacePlusPlusAttributes;
  landmark?: FacePlusPlusLandmark;
}

interface FacePlusPlusResponse {
  faces: FacePlusPlusFace[];
  image_id: string;
  request_id: string;
  time_used: number;
  face_num: number;
  error_message?: string;
  image_width?: number;
  image_height?: number;
}

// Raw analysis result interface
export interface PassportAnalysisData {
  faceDetection: {
    faceCount: number;
    faceDetected: boolean;
    faceRectangle?: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  };
  background: {
    estimatedBackground: "plain" | "complex" | "unknown";
    faceToImageRatio: number;
    imageWidth?: number;
    imageHeight?: number;
  };
  imageQuality: {
    overallQuality?: {
      threshold: number;
      value: number;
    };
    blur?: {
      blurness: { threshold: number; value: number };
      motionblur?: { threshold: number; value: number };
      gaussianblur?: { threshold: number; value: number };
    };
    skinStatus?: {
      health: number;
      stain: number;
      acne: number;
      dark_circle: number;
    };
  };
  faceSize: {
    width: number;
    height: number;
    area: number;
    percentageOfImage: number;
  };
  eyeLevel: {
    leftEye: {
      normal: number;
      occlusion: number;
      open: number;
      closed: number;
    };
    rightEye: {
      normal: number;
      occlusion: number;
      open: number;
      closed: number;
    };
    eyePositions?: {
      leftEye: { x: number; y: number };
      rightEye: { x: number; y: number };
    };
    eyeLevelAlignment?: number;
  };
  lighting: {
    estimatedFromQuality: number;
    skinHealth: number;
  };
  expression: {
    smile: {
      threshold: number;
      value: number;
    };
    emotions: {
      anger: number;
      disgust: number;
      fear: number;
      happiness: number;
      neutral: number;
      sadness: number;
      surprise: number;
    };
    dominantEmotion: string;
  };
  headPosition: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  additionalData: {
    age?: number;
    gender?: string;
    glasses?: string;
    apiProcessingTime: number;
    apiRequestId: string;
  };
}

export async function analyzePassportWithFacePlusPlus(
  imageDataUrl: string
): Promise<PassportAnalysisData | { error: string }> {
  try {
    // Convert data URL to base64
    const base64Data = imageDataUrl.split(",")[1];

    // Face++ API configuration
    const apiKey = process.env.FACEPP_API_KEY;
    const apiSecret = process.env.FACEPP_API_SECRET;

    if (!apiKey || !apiSecret) {
      return { error: "Face++ API credentials not configured" };
    }

    // Prepare URL-encoded form data (not FormData for base64)
    const params = new URLSearchParams();
    params.append("api_key", apiKey);
    params.append("api_secret", apiSecret);
    params.append("image_base64", base64Data);
    params.append(
      "return_attributes",
      "gender,age,emotion,eyestatus,facequality,blur,headpose,eyegaze"
      // "gender,age,emotion,eyestatus,facequality,blur,headpose,smile,skinstatus,beauty,mouthstatus,eyegaze"
    );
    // params.append("return_landmark", "1");

    // Call Face++ API with proper headers
    const response = await fetch(
      "https://api-us.faceplusplus.com/facepp/v3/detect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Face++ API Error Response:", errorText);
      return { error: `Face++ API error: ${response.status} - ${errorText}` };
    }

    const result: FacePlusPlusResponse = await response.json();

    if (result.error_message) {
      return { error: `Face++ API error: ${result.error_message}` };
    }
    // Extract and structure the raw data
    console.log(extractRawAnalysisData(result))
    return extractRawAnalysisData(result);
  } catch (error) {
    console.error("Error analyzing passport photo:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function extractRawAnalysisData(
  result: FacePlusPlusResponse
): PassportAnalysisData {
  const face = result.faces[0];
  const attrs = face?.attributes;
  const landmarks = face?.landmark;

  // Calculate image dimensions estimate (Face++ doesn't always return image dimensions)
  const imageWidth = result.image_width || 1000; // Fallback estimate
  const imageHeight = result.image_height || 1000; // Fallback estimate

  // Face size calculations
  const faceWidth = face?.face_rectangle.width || 0;
  const faceHeight = face?.face_rectangle.height || 0;
  const faceArea = faceWidth * faceHeight;
  const imageArea = imageWidth * imageHeight;
  const facePercentage = (faceArea / imageArea) * 100;

  // Background estimation (simple heuristic)
  const faceToImageRatio = Math.max(
    faceWidth / imageWidth,
    faceHeight / imageHeight
  );
  const estimatedBackground = faceToImageRatio > 0.4 ? "plain" : "complex";

  // Eye level alignment calculation
  let eyeLevelAlignment = 0;
  let eyePositions;
  if (landmarks?.left_eye_center && landmarks?.right_eye_center) {
    const leftEye = landmarks.left_eye_center;
    const rightEye = landmarks.right_eye_center;
    eyePositions = { leftEye, rightEye };
    // Calculate horizontal alignment (0 = perfectly aligned)
    eyeLevelAlignment = Math.abs(leftEye.y - rightEye.y);
  }

  // Dominant emotion
  let dominantEmotion = "neutral";
  if (attrs?.emotion) {
    const emotions = attrs.emotion;
    dominantEmotion = Object.entries(emotions).reduce((a, b) =>
      emotions[a[0] as keyof typeof emotions] >
      emotions[b[0] as keyof typeof emotions]
        ? a
        : b
    )[0];
  }

  return {
    faceDetection: {
      faceCount: result.face_num,
      faceDetected: result.face_num > 0,
      faceRectangle: face?.face_rectangle,
    },
    background: {
      estimatedBackground,
      faceToImageRatio,
      imageWidth,
      imageHeight,
    },
    imageQuality: {
      overallQuality: attrs?.facequality,
      blur: attrs?.blur,
      skinStatus: attrs?.skinstatus,
    },
    faceSize: {
      width: faceWidth,
      height: faceHeight,
      area: faceArea,
      percentageOfImage: facePercentage,
    },
    eyeLevel: {
      leftEye: {
        normal: attrs?.eyestatus?.left_eye_status.normal || 0,
        occlusion: attrs?.eyestatus?.left_eye_status.occlusion || 0,
        open: attrs?.eyestatus?.left_eye_status.no_glass_eye_open || 0,
        closed: attrs?.eyestatus?.left_eye_status.no_glass_eye_close || 0,
      },
      rightEye: {
        normal: attrs?.eyestatus?.right_eye_status.normal || 0,
        occlusion: attrs?.eyestatus?.right_eye_status.occlusion || 0,
        open: attrs?.eyestatus?.right_eye_status.no_glass_eye_open || 0,
        closed: attrs?.eyestatus?.right_eye_status.no_glass_eye_close || 0,
      },
      eyePositions,
      eyeLevelAlignment,
    },
    lighting: {
      estimatedFromQuality: attrs?.facequality?.value || 0,
      skinHealth: attrs?.skinstatus?.health || 0,
    },
    expression: {
      smile: attrs?.smile || { threshold: 0, value: 0 },
      emotions: attrs?.emotion || {
        anger: 0,
        disgust: 0,
        fear: 0,
        happiness: 0,
        neutral: 100,
        sadness: 0,
        surprise: 0,
      },
      dominantEmotion,
    },
    headPosition: {
      pitch: attrs?.headpose?.pitch_angle || 0,
      roll: attrs?.headpose?.roll_angle || 0,
      yaw: attrs?.headpose?.yaw_angle || 0,
    },
    additionalData: {
      age: attrs?.age?.value,
      gender: attrs?.gender?.value,
      glasses: attrs?.glass?.value,
      apiProcessingTime: result.time_used,
      apiRequestId: result.request_id,
    },
  };
}
