import { CodeGenFunctionImplementations, CodeGenFunctions } from "../types.ts";

export const functions: CodeGenFunctions = {
  IMG_Init: {
    parameters: {
      flags: {
        type: "int",
      },
    },
    result: {
      type: "int",
    },
  },

  IMG_Linked_Version: {
    parameters: {},
    result: {
      type: "SDL_version*",
    },
  },

  IMG_Load: {
    parameters: {
      file: {
        type: "char*",
      },
    },
    result: {
      type: "SDL_Surface*",
    },
  },

  IMG_Quit: {
    parameters: {},
    result: {
      type: "void",
    },
  },
} as const;

export const functionImplementations: CodeGenFunctionImplementations = {
  IMG_Init: `export function Init(flags: number, libraryPath?: string): number {
    // TODO: Improve this logic.
    if (!libraryPath) {
      libraryPath = "libSDL2_image";
    }
  
    context.library = Deno.dlopen(libraryPath, symbols);
    context.symbols = context.library.symbols;
  
    return context.symbols.IMG_Init(flags) as number;
  }`,

  IMG_Quit: `export function Quit(): void {
    context.symbols.IMG_Quit();
    context.library.close();
  }`,
} as const;