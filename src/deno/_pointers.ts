import { Pointer } from "../pointers.ts";
import { f32, f64, i16, i32, i64, i8, u16, u32, u64, u8 } from "../types.ts";
import { PlatformPointer } from "../_types.ts";
import { ENDIANNESS, isTypedArray } from "../_utils.ts";

export function denoToPlatformPointer<T>(value: Pointer<T> | null): PlatformPointer<T> | null {
  let result: ReturnType<typeof denoToPlatformPointer> = null;

  if (value) {
    if (isTypedArray(value._data)) {
      result = Deno.UnsafePointer.of(value._data) as unknown as PlatformPointer<T>;
    } else {
      result = value._data;
    }

    if (value._offset != 0) {
      result = Deno.UnsafePointer.offset(
        result as unknown as NonNullable<Deno.PointerValue>,
        value._offset,
      ) as unknown as PlatformPointer<T>;
    }
  }

  return result;
}

export function denoFromPlatformPointer<T>(value: PlatformPointer<T>): Pointer<T> | null {
  if (value === null) {
    return null;
  }

  return new Pointer(value as unknown as PlatformPointer<T>);
}

export class DenoPlatformDataView {
  private static DATA_MUST_BE_ARRAY_BUFFER_ERROR = "data must be an instance of ArrayBuffer in order to set values.";

  public static LITTLE_ENDIAN = ENDIANNESS === "LE";

  private _view: globalThis.DataView | Deno.UnsafePointerView;

  constructor(
    public readonly data: Uint8Array | PlatformPointer<unknown>,
  ) {
    if (this.data instanceof Uint8Array) {
      this._view = new globalThis.DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
    } else {
      this._view = new Deno.UnsafePointerView(this.data as unknown as NonNullable<Deno.PointerValue>);
    }
  }

  private static ensureViewIsDataView(
    view: globalThis.DataView | Deno.UnsafePointerView,
  ): asserts view is globalThis.DataView {
    if (!(view instanceof globalThis.DataView)) {
      throw new Error(DenoPlatformDataView.DATA_MUST_BE_ARRAY_BUFFER_ERROR);
    }
  }

  public getArray(byteLength: number, byteOffset: number): Uint8Array {
    if (this._view instanceof globalThis.DataView) {
      throw new Error("Not implemented.");
    } else {
      return new Uint8Array(this._view.getArrayBuffer(byteLength, byteOffset));
    }
  }

  public getF32(byteOffset: number): f32 {
    return this._view.getFloat32(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as f32;
  }

  public getF64(byteOffset: number): f64 {
    return this._view.getFloat64(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as f64;
  }

  public getI8(byteOffset: number): i8 {
    return this._view.getInt8(byteOffset) as i8;
  }

  public getI16(byteOffset: number): i16 {
    return this._view.getInt16(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as i16;
  }

  public getI32(byteOffset: number): i32 {
    return this._view.getInt32(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as i32;
  }

  public getI64(byteOffset: number): i64 {
    return this._view.getBigInt64(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as i64;
  }

  public getPointer<T>(byteOffset: number): Pointer<T> {
    // TODO: We should test here if we're on 32 or 64 bit.
    return denoFromPlatformPointer(
      Deno.UnsafePointer.create(
        this._view.getBigUint64(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN),
      ) as unknown as PlatformPointer<T>,
    ) as Pointer<T>;
  }

  public getU8(byteOffset: number): u8 {
    return this._view.getUint8(byteOffset) as u8;
  }

  public getU16(byteOffset: number): u16 {
    return this._view.getUint16(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as u16;
  }

  public getU32(byteOffset: number): u32 {
    return this._view.getUint32(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as u32;
  }

  public getU64(byteOffset: number): u64 {
    return this._view.getBigUint64(byteOffset, DenoPlatformDataView.LITTLE_ENDIAN) as u64;
  }

  public setF32(byteOffset: number, value: f32): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setFloat32(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setF64(byteOffset: number, value: f64): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setFloat64(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setI8(byteOffset: number, value: i8): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setInt8(byteOffset, value);
  }

  public setI16(byteOffset: number, value: i16): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setInt16(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setI32(byteOffset: number, value: i32): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setInt32(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setI64(byteOffset: number, value: i64): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setBigInt64(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setPointer<T>(byteOffset: number, value: Pointer<T>): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    // TODO: We should test here if we're on 32 or 64 bit.
    return this._view.setBigUint64(
      byteOffset,
      BigInt(Deno.UnsafePointer.value(denoToPlatformPointer(value) as unknown as NonNullable<Deno.PointerValue>)),
      DenoPlatformDataView.LITTLE_ENDIAN,
    );
  }

  public setU8(byteOffset: number, value: u8): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setUint8(byteOffset, value);
  }

  public setU16(byteOffset: number, value: u16): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setUint16(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setU32(byteOffset: number, value: u32): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setUint32(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }

  public setU64(byteOffset: number, value: u64): void {
    DenoPlatformDataView.ensureViewIsDataView(this._view);
    this._view.setBigUint64(byteOffset, value, DenoPlatformDataView.LITTLE_ENDIAN);
  }
}
