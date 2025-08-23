import { type Complex, Matrix2DxComplex, waistSize, beamProps } from '$lib/math/gcomplex';
import { SourceClass } from '$lib/classes/SourceClass.svelte';
import { GaussClass } from '$lib/classes/GaussClass.svelte';
import { genLensLathe2, points2ArrayX, pointsToFloat32ArrayX, toGrid } from '$lib/math/mathUtils';
import type { LatheGeometry } from 'three';
import { Vector3 } from 'three';

	// define this interface - TODO: figure out how to do witout
export interface WaistPosi {
		waist: number;
		yscaled: number;
		zscaled: number;
	}

export function calcZend(gp: GaussClass[]) {
  let zend = 0;
  gp.forEach((op) => {
    if (op.type == 'distance') zend += op.value;
  });
  return zend;
}

// function for computing lens segs through system
export	function genLineSegs(
  gp: GaussClass[],
  source: SourceClass,
  scaleY: number,
  zScale: number[][],
  zinc: number
): [Float32Array, Float32Array] {
  const tsource = source.clone();
  console.log("🚀 ~ genLineSegs ~ tsource:", tsource)
  
  const zrj = tsource.rayleighDistance();
  let p: Complex = { real: 0, imag: zrj };

  const zsave: number[] = [];
  const wsave: number[] = [];
  const z: number[] = [];
  const w: number[] = [];

  let zbase = 0; // local beam path used to find waist
  let ztrack = 0; // this tracks the beam path in world z
  let offset = 0;
  gp.forEach((op) => {
    switch (op.type) {
      case 'distance':
        for (let d = 0; d <= op.value; d += zinc) {
          p.real = d + offset;
          ztrack = zbase + d;
          console.log("🚀 ~ genLineSegs ~ p:", p);
          const wsize = waistSize(p, tsource, source.ior);
          console.error("🚀 ~ genLineSegs ~ wsize:", wsize);
          zsave.push(ztrack);
          wsave.push(wsize);
          z.push(toGrid(ztrack, zScale));
          //w.push(wsize * scaleY);
          w.push(10);
        }
        offset = p.real; // do this in case the next surface is distance and not a lens
        break;
      case 'lens':
        p = Matrix2DxComplex(op.toMatrix2D(), p);
        //[znew, minwaist, roc, wz];
        offset = beamProps(p, tsource, tsource.ior)[0];  // index here is separated in case of inside lens
        break;
    }
    zbase = ztrack;
  });

  //saveTextToFile(converXYtoString(zsave, wsave), 'z-w.txt');
  //const temp = Math.max(...w);
  //maxY = setAxisLimits(0, temp)[1];
  const [plussegs, negsegs] = points2ArrayX(0, w, z);
  return [plussegs, negsegs];
}

// function for computing lens segs through system
export	function genLineSegArray(
  gp: GaussClass[],
  source: SourceClass,
  scaleY: number,
  zScale: number[][],
  zinc: number
): [Float32Array[], Float32Array[]] {
  const tsource = source.clone();
  const zrj = tsource.rayleighDistance();
  // console.log("🚀 ~ genLineSegArrays ~ tsource:", tsource)
  // console.log("🚀 ~ genLineSegArrays ~ scaleY:", scaleY)
  // console.log("🚀 ~ genLineSegArrays ~ zinc:", zinc)
  // console.log("🚀 ~ genLineSegArrays ~ zScale:", zScale)
  // console.log("🚀 ~ genLineSegArrays ~ zrj:", zrj)
  // console.log("🚀 ~ genLineSegArrays ~ tsource.ior:", tsource.ior)
  // console.log("🚀 ~ genLineSegArrays ~ tsource.wavelength:", tsource.wavelength)
  // console.log("🚀 ~ genLineSegArrays ~ tsource:", tsource.toString())
  // console.log("🚀 ~ genLineSegArrays ~ source:", source.toString())
  let p: Complex = { real: 0, imag: zrj };

  const zsave: number[] = [];
  const wsave: number[] = [];

  const psegs: Float32Array[] = [];
  const nsegs: Float32Array[] = [];


  let zbase = 0; // local beam path used to find waist
  let ztrack = 0; // this tracks the beam path in world z
  let offset = 0;
  gp.forEach((op) => {
    switch (op.type) {
      case 'distance': {
        const z: number[] = [];
        const w: number[] = [];
        for (let d = 0; d <= op.value; d += zinc) {
          p.real = d + offset;
          ztrack = zbase + d;
          // console.log("🚀 ~ offset, d, p.real:", offset, d, p.real);
          // console.log("🚀 ~ tsource: ", tsource);
          const wsize = waistSize(p, tsource, source.ior);
          // console.log("🚀 ~ genLineSegArray ~ wsize:", wsize)
          zsave.push(ztrack);
          wsave.push(wsize);
          z.push(toGrid(ztrack, zScale));
          // w.push(10);
          w.push(wsize * scaleY);
        }
        const [plus, neg] = points2ArrayX(0, w, z);
        psegs.push(plus);
        nsegs.push(neg);
        // console.log("🚀 ~ offset, p", offset, p)
        offset = p.real; // do this in case the next surface is distance and not a lens
        // console.log("🚀 ~ Dist offset, p: ", offset, p.real)
        break;
      }
      case 'lens':
        // console.log("🚀 ~ Lens p:", p)
        // console.log("🚀 ~ Lens op:", op.toString())
        // console.log("🚀 ~ Lens op matrix:", op.toMatrix2D())
        p = Matrix2DxComplex(op.toMatrix2D(), p);
        // console.log("🚀 ~ Lens p:", p)
        //[znew, minwaist, roc, wz];
        offset = beamProps(p, tsource, tsource.ior)[0];  // index here is separated in case of inside lens
        // console.log("🚀 ~ Lens offset: ", offset)
        break;
    }
    zbase = ztrack;
  });

  //saveTextToFile(converXYtoString(zsave, wsave), 'z-w.txt');
  //const temp = Math.max(...w);
  //maxY = setAxisLimits(0, temp)[1];

  return [psegs, nsegs];
}

export	function gaussProfile( waist: number, iMag: number): Float32Array {
  const x: number[] = [];
  const I: number[] = [];

  for (let r = -1.5*waist; r <= 1.5*waist; r += 0.1) {
    x.push(r);
    I.push(iMag * Math.exp(-2 * r * r / (waist * waist)));
  }
  const data = pointsToFloat32ArrayX(0, I, x);
  //console.log(data)
  return data;
}

export	function gaussVectorProfile( waist: number, iMag: number): Vector3[] {
  const vectorData: Vector3[] = [];

  for (let r = -1.5*waist; r <= 1.5*waist; r += 0.1) {
    const y = iMag * Math.exp(-2 * r * r / (waist * waist));
    vectorData.push(new Vector3(0, y, r));
  }
  return vectorData;
}

// function for computing lens segs
export function findMinWaists(
  gp: GaussClass[], 
  tsource: SourceClass, 
  scaleY: number,
  zScale: number[][] 
  ): WaistPosi[] {
  const zrj = tsource.rayleighDistance();
  let p: Complex = { real: 0, imag: zrj };

  let zbase = 0;
  let ztrack = 0;

  const wps: WaistPosi[] = [];

  gp.forEach((op) => {
    switch (op.type) {
      case 'distance':
        p.real += op.value;
        ztrack = zbase + op.value;
        break;
      case 'lens': {
        //  return [znew, minwaist, roc, wz];
        p = Matrix2DxComplex(op.toMatrix2D(), p);
        const [znew, waist, roc, ] = beamProps(p, tsource, tsource.ior); // n=1.0 is index will
        const zreal = ztrack - znew;
        if (Math.abs(roc) < 500 && zreal > 0 && zreal < 2020) {
          const w: WaistPosi = {
            waist: waist,
            yscaled: waist * scaleY,
            zscaled: toGrid(zreal, zScale)
          };
          wps.push(w);
        }
        break;
      }
    }
    zbase = ztrack;
  });
  return wps;
}

// this routine will find the waist size at each transform
export function findWaistSizes(gp: GaussClass[], tsource: SourceClass): number[] {
  const zrj = tsource.rayleighDistance();
  let p: Complex = { real: 0, imag: zrj };

  let zbase = 0;
  let ztrack = 0;

  const wSizes: number[] = [];
  wSizes.push(beamProps(p, tsource, tsource.ior)[3]);
  gp.forEach((op) => {
    switch (op.type) {
      case 'distance':
        p.real += op.value;
        ztrack = zbase + op.value;
        wSizes.push(beamProps(p, tsource, tsource.ior)[3]);
        break;
      case 'lens':
        //  return [znew, minwaist, roc, wz];
        p = Matrix2DxComplex(op.toMatrix2D(), p);
        wSizes.push(beamProps(p, tsource, tsource.ior)[3]); // future change 1 to lens index if inside lens
        break;
    }
    zbase = ztrack;
  });
  return wSizes;
}

// generate lens items needed to plot
export function generateLensData(
  gp: GaussClass[], tsource: SourceClass,
  scaleZ: number,
  scaleY: number,
  zScale: number[][]
): [number[], [number, number, number][], GaussClass[], number[], [number, number, number][], LatheGeometry[]] {


  const zrj = tsource.rayleighDistance();
  let p: Complex = { real: 0, imag: zrj };

  let zbase = 0;
  let ztrack = 0;

  const radius: number[] = [];
  const lensPosi: [number, number, number][] = [];
  const gop: GaussClass[] = [];
  const gopIndex: number[] = [];
  const eflLabelPosi: [number, number, number][] = [];
  const geos: LatheGeometry[] = [];

  gp.forEach((op, index) => {
    switch (op.type) {
      case 'distance':
        p.real += op.value;
        ztrack = zbase + op.value;
        break;
      case 'lens': {
        p = Matrix2DxComplex(op.toMatrix2D(), p);
        const rtemp = waistSize(p, tsource, tsource.ior); // change 1 to material index if inside lens
        radius.push(rtemp * 1.5);
        const posi: [number, number, number] = [0, 0, toGrid(ztrack, zScale)];
        lensPosi.push(posi);
        gop.push(op.clone());
        gopIndex.push(index);
        eflLabelPosi.push([0, 1.5 * rtemp * scaleY, toGrid(ztrack, zScale)]);
        geos.push(genLensLathe2(rtemp * 1.4, op.value, scaleZ, scaleY));
        break;
      }
    }
    zbase = ztrack;
  });
  return [radius, lensPosi, gop, gopIndex, eflLabelPosi, geos];
}

// returns a list of indices for a given type of element
export function genTypeMap(gpin: GaussClass[], mapType: string) {
  const gpmap: number[] = [];

  gpin.forEach((element, index) => {
    if (element.type === mapType) {
      gpmap.push(index);
    }
  });
  return gpmap;
}