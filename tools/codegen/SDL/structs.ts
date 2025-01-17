import { CodeGenOpaqueStructs, CodeGenStructs } from "../types.ts";

export const opaqueStructs: CodeGenOpaqueStructs = [
  // TODO: Figure out how to implement SDL_RWops in deno.
  // "SDL_BlitMap",
  "SDL_Renderer",
  "SDL_RWops",
  "SDL_Texture",
  "SDL_Window",
];

export const structs: CodeGenStructs = {
  SDL_Color: {
    allocatable: true,
    writable: true,
    size: 4,
    members: {
      r: {
        type: "Uint8",
        offset: 0,
      },
      g: {
        type: "Uint8",
        offset: 1,
      },
      b: {
        type: "Uint8",
        offset: 2,
      },
      a: {
        type: "Uint8",
        offset: 3,
      },
    },
  },

  SDL_Keysym: {
    size: 16,
    members: {
      scancode: {
        type: "SDL_Scancode",
        offset: 0,
      },
      sym: {
        type: "SDL_Keycode",
        offset: 4,
      },
      mod: {
        type: "Uint16",
        offset: 8,
      },
      unused: {
        type: "Uint32",
        offset: 12,
      },
    },
  },

  SDL_Palette: {
    size: 24,
    members: {
      ncolors: {
        type: "int",
        offset: 0,
      },
      colors: {
        type: "SDL_Color*",
        offset: 8,
      },
      // Internal
      // version: {
      //   type: "Uint32",
      //   offset: 16,
      // },
      // refcount: {
      //   type: "int",
      //   offset: 20,
      // },
    },
  },

  SDL_PixelFormat: {
    size: 56,
    members: {
      format: {
        type: "Uint32",
        offset: 0,
      },
      palette: {
        type: "SDL_Palette*",
        offset: 8,
      },
      BitsPerPixel: {
        type: "Uint8",
        offset: 16,
      },
      BytesPerPixel: {
        type: "Uint8",
        offset: 17,
      },
      Rmask: {
        type: "Uint32",
        offset: 20,
      },
      Gmask: {
        type: "Uint32",
        offset: 24,
      },
      Bmask: {
        type: "Uint32",
        offset: 28,
      },
      Amask: {
        type: "Uint32",
        offset: 32,
      },
      // Internal
      // Rloss: {
      //   type: "Uint8",
      //   offset: 36,
      // },
      // Gloss: {
      //   type: "Uint8",
      //   offset: 37,
      // },
      // Bloss: {
      //   type: "Uint8",
      //   offset: 38,
      // },
      // Aloss: {
      //   type: "Uint8",
      //   offset: 39,
      // },
      // Rshift: {
      //   type: "Uint8",
      //   offset: 40,
      // },
      // Gshift: {
      //   type: "Uint8",
      //   offset: 41,
      // },
      // Bshift: {
      //   type: "Uint8",
      //   offset: 42,
      // },
      // Ashift: {
      //   type: "Uint8",
      //   offset: 43,
      // },
      // refcount: {
      //   type: "int",
      //   offset: 44,
      // },
      // next: {
      //   type: "SDL_PixelFormat*",
      //   offset: 48,
      // },
    },
  },

  SDL_Point: {
    allocatable: true,
    writable: true,
    size: 8,
    members: {
      x: {
        type: "int",
        offset: 0,
      },
      y: {
        type: "int",
        offset: 4,
      },
    },
  },

  SDL_Rect: {
    allocatable: true,
    writable: true,
    size: 16,
    members: {
      x: {
        type: "int",
        offset: 0,
      },
      y: {
        type: "int",
        offset: 4,
      },
      w: {
        type: "int",
        offset: 8,
      },
      h: {
        type: "int",
        offset: 12,
      },
    },
  },

  SDL_RendererInfo: {
    allocatable: true,
    writable: false,
    size: 88,
    members: {
      name: {
        type: "char*",
        offset: 0,
      },
      flags: {
        type: "Uint32",
        offset: 8,
      },
      num_texture_formats: {
        type: "Uint32",
        offset: 12,
      },
      // TODO: Add support for arrays in structs.
      // texture_formats: {
      //   type: "Uint32",
      //   type: "u32",
      //   offset: 16,
      // },
      max_texture_width: {
        type: "int",
        offset: 80,
      },
      max_texture_height: {
        type: "int",
        offset: 84,
      },
    },
  },

  SDL_Surface: {
    size: 96,
    members: {
      flags: {
        type: "Uint32",
        offset: 0,
      },
      format: {
        type: "SDL_PixelFormat*",
        offset: 8,
      },
      w: {
        type: "int",
        offset: 16,
      },
      h: {
        type: "int",
        offset: 20,
      },
      pitch: {
        type: "int",
        offset: 24,
      },
      pixels: {
        type: "void*",
        offset: 32,
      },
      userdata: {
        type: "void*",
        offset: 40,
      },
      // Interanl
      // locked: {
      //   type: "int",
      //   offset: 48,
      // },
      // Internal
      // list_data: {
      //   type: "void*",
      //   offset: 56,
      // },
      clip_rect: {
        type: "SDL_Rect",
        offset: 64,
      },
      // Internal
      // map: {
      //   type: "SDL_BlitMap*",
      //   offset: 80,
      // },
      refcount: {
        type: "int",
        offset: 88,
      },
    },
  },

  SDL_version: {
    allocatable: true,
    size: 3,
    members: {
      major: {
        type: "Uint8",
        offset: 0,
      },
      minor: {
        type: "Uint8",
        offset: 1,
      },
      patch: {
        type: "Uint8",
        offset: 2,
      },
    },
  },
} as const;
