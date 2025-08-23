/**
 * SourceClass represents a light source with specific properties.
 * It includes parameters: wavelength, beam waist (w0), waist position,
 * M² value, and index of refraction (ior).\n
 * 
 * The class provides methods to calculate the Rayleigh distance and 
 * clone the source.
 * 
 * 
 * All values except wavelength are in mm.
 * 
 * The wavelength is in micrometers (μm).
 */
export class SourceClass {
  wavelength: number;
  w0: number;
  waistposition: number;
  msq: number;
  ior: number;
  constructor(
      wavelength: number, 
      w0: number, 
      waistposition: number, 
      msq: number, 
      ior: number
    ) {
        this.wavelength = $state(wavelength);
        this.w0 = $state(w0);
        this.waistposition = $state(waistposition);
        this.msq = $state(msq);
        this.ior = $state(ior);
      }

      // I would like to add a function that would initialize a
      // Source with specific parameters, 1.07, 1, 0, 1, 1
      public static createDefault(): SourceClass {
        return new SourceClass(1.07, 1, 0, 1, 1);
      }

      public rayleighDistance(): number {
          return (Math.PI * this.w0 * this.w0 * this.ior) / ((this.wavelength * this.msq) / 1000);
      }

    toString() {
      return `SourceClass {
        wavelength: ${this.wavelength},
        w0: ${this.w0},
        waistposition: ${this.waistposition},
        msq: ${this.msq},
        ior: ${this.ior}
      }`;
    }

    clone() {
      return new SourceClass(this.wavelength, this.w0, this.waistposition, this.msq, this.ior)
    }

  }

export class DoubletClass {
  a: number;
  b: number;

  constructor(initialA: number = 10, initialB: number = 20) {
    this.a = initialA;
    this.b = initialB;
  }

  update(changes: Partial<DoubletClass>): DoubletClass {
    return new DoubletClass(
      changes.a ?? this.a,
      changes.b ?? this.b,
    );
  }
}
