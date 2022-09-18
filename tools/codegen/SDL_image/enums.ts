import { CodeGenEnums } from "../types.ts";

export const enums: CodeGenEnums = {
  IMG_InitFlags: {
    values: {
      IMG_INIT_JPG: "0x00000001",
      IMG_INIT_PNG: "0x00000002",
      IMG_INIT_TIF: "0x00000004",
      IMG_INIT_WEBP: "0x00000008",
      IMG_INIT_JXL: "0x00000010",
      IMG_INIT_AVIF: "0x00000020",
    },
  },
} as const;
