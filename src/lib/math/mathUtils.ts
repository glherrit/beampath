import { Vector2, Vector3, LatheGeometry } from 'three'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
// import { Lut } from 'three/examples/jsm/math/Lut'

export function calcSag(radius: number, R: number, k: number): number {
  const sag = (radius * radius / R) / (1 + Math.sqrt(1 - (1 + k) * Math.pow(radius, 2) / Math.pow(R, 2) ) );
  return sag;
}


export function genLensLathe(ap: number, Radius1: number, Radius2: number, ct: number, xscale: number, yscale: number, divisionsperlensseg = 21, radialdivisions = 51) {
  const pts1plus = []
  const pts2plus = []
  const step = ap / (divisionsperlensseg - 1)

  // define lens arc
  for (let i = 0; i < divisionsperlensseg; i++) {
    const r = i * step
    //const sag1 = Math.sign(Radius1) * (Math.abs(Radius1) - Math.sqrt(Radius1*Radius1 - r*r))
    //const sag2 = Math.sign(Radius2) * (Math.abs(Radius2) - Math.sqrt(Radius2*Radius2 - r*r))
    const sag1 = calcSag(r, Radius1, 0) - ct / 2
    const sag2 = calcSag(r, Radius2, 0) - ct / 2
    pts1plus.push(new Vector2(r * yscale, sag1 / xscale))
    pts2plus.push(new Vector2(r * yscale, (sag2 + ct) / xscale))
  }
  return new LatheGeometry(pts1plus.concat(pts2plus.reverse()), radialdivisions, 0, Math.PI * 2)
}

export function genLensLathe2(ap: number, efl: number, xscale: number, yscale: number, divisionsperlensseg = 21, radialdivisions = 51) {
  const pts1plus = []
  const pts2plus = []
  const step = ap / (divisionsperlensseg - 1)

  const R = ap * 3;
  let Radius1 = 0;
  let Radius2 = 0;
  let ct = 0;

  const ctoffset = 0; // doing this produces a uniform for all xscales
  if (efl >= 0) {
    Radius1 = R;
    Radius2 = -R;
    ct = 1.2 * calcSag(ap, Radius1, 0) + ctoffset;
  }

  const ctoffsetneg = 1; // doing this produces a uniform for all xscales
  if (efl < 0) {
    Radius1 = -R;
    Radius2 = R;
    ct = ctoffsetneg * 1;
  }

  // define lens arc
  for (let i = 0; i < divisionsperlensseg; i++) {
    const r = i * step
    //const sag1 = Math.sign(Radius1) * (Math.abs(Radius1) - Math.sqrt(Radius1*Radius1 - r*r))
    //const sag2 = Math.sign(Radius2) * (Math.abs(Radius2) - Math.sqrt(Radius2*Radius2 - r*r))
    const sag1 = calcSag(r, Radius1, 0)
    const sag2 = calcSag(r, Radius2, 0)
    pts1plus.push(new Vector2(r * yscale, (sag1 - ct) * xscale))
    pts2plus.push(new Vector2(r * yscale, (sag2 + ct) * xscale))
  }
  return new LatheGeometry(pts1plus.concat(pts2plus.reverse()), radialdivisions, 0, Math.PI * 2)
}

export function toGrid(zpoint: number, scale: number[][]): number {
    // g1 = gridWidth
  // g0 = -gridWidth
  // z1 = zend
  // z0 = zstart
  // (gpoint - g0) / (zpoint - z0) = (g1 - g0) / (z1 - z0)
  // gpoint = (zpoint - z0) * (g1 - g0) / (z1 - z0) + g0
  return (
    (zpoint - scale[0][0]) * (scale[1][1] - scale[1][0]) / (scale[0][1] - scale[0][0]) + scale[1][0]
  )
}

export function toWorld(gpoint: number, scale: number[][]): number {
  // g1 = gridWidth
  // g0 = -gridWidth
  // z1 = zend
  // z0 = zstart
  // (gpoint - g0) / (zpoint - z0) = (g1 - g0) / (z1 - z0)
  // zpoint = (gpoint - g0) * (z1 - z0) / (g1 - g0) + z0

  return (
    ((gpoint - scale[1][0]) * (scale[0][1] - scale[0][0])) / (scale[1][1] - scale[1][0]) + scale[0][0]
  )
}

export function genLineGeometry(pts: Vector3[]): LineGeometry {
  const floatArray: Float32Array = Float32Array.from(pts.flatMap((v) => [v.x, v.y, v.z]))
  const geo = new LineGeometry()
  geo.setPositions(floatArray)
  return geo
}

export function genLineSegment(segs: Float32Array): LineGeometry {
  const geo = new LineGeometry()
  geo.setPositions(segs)
  return geo
}

export function genLineSegment2(v0: Vector3, v1: Vector3): LineGeometry {
  const geo = new LineGeometry()
  geo.setPositions(new Float32Array([v0.x, v0.y, v0.z, v1.x, v1.y, v1.z]))
  return geo
}

// export function generateLatheColors(
//   image: BufferGeometry,
//   maxZ: number,
//   colorscheme = 'rainbow',
//   numcolors = 101
// ): Float32Array {
//   const lut = new Lut(colorscheme, numcolors)
//   const numVectors = (image.getAttribute('position') as BufferAttribute).array.length / 3
//   const lathcolors = new Float32Array(numVectors * 3)
//   let lcolposi = 0

//   for (let i = 0; i < numVectors; i++) {
//     const yh = (image.getAttribute('position') as BufferAttribute).array[3 * i + 1]
//     const colorindex = yh / maxZ
//     lathcolors.set(
//       [lut.getColor(colorindex).r, lut.getColor(colorindex).g, lut.getColor(colorindex).b],
//       lcolposi
//     )
//     lcolposi += 3
//   }
//   return lathcolors
// }

export function findMinsAndMaxs(
  points: number[][]
): [xmin: number, xmax: number, ymin: number, ymax: number] {
  let xmax = -1e10
  let xmin = 1e10
  let ymax = -1e10
  let ymin = 1e10
  for (let i = 0; i < points.length; i++) {
    if (points[i][1] < ymin) {
      ymin = points[i][1]
    }
    if (points[i][1] > ymax) {
      ymax = points[i][1]
    }
    if (points[i][0] < xmin) {
      xmin = points[i][0]
    }
    if (points[i][0] > xmax) {
      xmax = points[i][0]
    }
  }
  return [xmin, xmax, ymin, ymax]
}

export function doubleArrayToVector2(points: number[][], scalex: number, scaley: number) {
  const vdata: Vector2[] = []
  for (let i = 0; i < points.length; i++) {
    vdata.push(new Vector2(points[i][0] * scalex, points[i][1] * scaley))
  }
  return vdata
}

export function arrayToScaledVector2(
  points: number[][],
  xmin: number,
  xmax: number,
  scaledX: number,
  ymin: number,
  ymax: number,
  scaledY: number
) {
  const vdata: Vector2[] = []
  for (let i = 0; i < points.length; i++) {
    const newx = (scaledX * (points[i][0] - xmin)) / (xmax - xmin)
    const newy = (scaledY * (points[i][1] - ymin)) / (ymax - ymin)
    vdata.push(new Vector2(newx, newy))
  }
  return vdata
}

export function arrayToScaledVector3(
  points: number[][],
  plotScale: number,
  zPosition: number,
  zScale: number
) {
  const vdata: Vector3[] = []
  for (let i = 0; i < points.length; i++) {
    vdata.push(new Vector3(plotScale * points[i][0], plotScale * points[i][1], zPosition * zScale))
  }
  return vdata
}

export function findVector2MinMaxY(data: Vector2[]): [number, number] {
  let max = -1e10
  let min = 1e10
  data.forEach(function (value) {
    if (value.y > max) {
      max = value.y
    }
    if (value.y < min) {
      min = value.y
    }
  })
  return [min, max]
}

export function findVector3MaxZ(data: Vector3[]): number {
  let max = -1e10
  data.forEach(function (value) {
    if (value.z > max) {
      max = value.z
    }
  })
  return max
}

export function interoplateZ(r: number, p: number[][]): number {
  for (let i = 0; i < p.length - 1; i++) {
    if (r >= p[i][0] && r < p[i + 1][0]) {
      const slope = (p[i + 1][0] - p[i][0]) / (p[i + 1][1] - p[i][1])
      return (r - p[i][0]) / slope + p[i][1]
    }
  }
  return 0.0
}

// creates a 3d point cloud from a double array
export function create3DPts(
  pts: number[][],
  npts: number,
  scale: number,
  scaleI: number
): Vector3[] {
  const array: Vector3[] = []
  const [, , , ymax] = findMinsAndMaxs(pts)
  const inc = (2 * ymax) / (npts - 1)
  for (let x = -ymax; x <= ymax * 1.0001; x += inc) {
    for (let y = -ymax; y <= ymax * 1.0001; y += inc) {
      const r = Math.sqrt(x * x + y * y)
      if (r > ymax) {
        array.push(new Vector3(x * scale, y * scale, 0))
      } else {
        array.push(new Vector3(x * scale, y * scale, interoplateZ(r, pts) * scaleI))
      }
    }
  }
  return array
}

export function genProfile2D(x: number[], y: number[]): Vector2[] {
  const vprofileData = []
  for (let i = x.length - 1; i > 0; i--) {
    vprofileData.push(new Vector2(-x[i], y[i]))
  }
  for (let i = 0; i < x.length; i++) {
    vprofileData.push(new Vector2(x[i], y[i]))
  }
  return vprofileData
}

export function genProfile3D(x: number | number[], y: number[], z: number | number[]): Vector3[] {
  const vprofileData = []
  // use this for plots in the z-y plane offset in x
  if (typeof x === 'number' && typeof z === 'object') {
    for (let i = z.length - 1; i > 0; i--) {
      vprofileData.push(new Vector3(x, y[i], -z[i]))
    }
    for (let i = 0; i < z.length; i++) {
      vprofileData.push(new Vector3(x, y[i], z[i]))
    }
  }
  // use this for plots in the x-y plane offset in z
  if (typeof x === 'object' && typeof z === 'number') {
    for (let i = x.length - 1; i > 0; i--) {
      vprofileData.push(new Vector3(-x[i], y[i], z))
    }
    for (let i = 0; i < x.length; i++) {
      vprofileData.push(new Vector3(x[i], y[i], z))
    }
  }
  return vprofileData
}

export function saveTextToFile(dataStr: string, filename: string) {
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(new Blob([dataStr], { type: 'text/plain' }))
  a.download = filename
  a.click()
}

export function converXYtoString(x: number[], y: number[]): string {
  let str = ''
  for (let i = 0; i < x.length; i++) {
    str += x[i] + ', ' + y[i] + '\n'
  }
  return str
}

function getExponent(x: number) {
  return Math.floor(Math.log10(x))
}

export function chooseAxisLimits(values: number[], ntics = 5): [number, number] {
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue
  let min = 0
  let max = 0
  // special cases for data range
  if (Math.abs(maxValue) === Math.abs(minValue)) {
    min = -maxValue
    max = maxValue
    return [min, max]
  }

  const inc = range / ntics
  const exp = getExponent(inc)
  const inc2 = Math.ceil(inc / Math.pow(10, exp)) * Math.pow(10, exp)

  // find closest increment to range
  min = Math.floor(minValue / inc2) * inc2
  max = Math.ceil(maxValue / inc2) * inc2

  // TODO: Do we want this behavior?
  // check for special cases where min is zero
  const minMaxLimit = 0.00001
  if (Math.abs(minValue) < minMaxLimit && Math.abs(maxValue) < minMaxLimit) {
    // limit min/max bipolar axes
    min = -minMaxLimit
    max = minMaxLimit
  } else if (minValue >= 0 && maxValue < minMaxLimit) {
    // min value close to 0
    min = 0.0
  } else if (maxValue > -minMaxLimit && maxValue <= 0) {
    // max value close to 0
    max = 0.0
  }

  return [min, max]
}

export function setAxisLimits(minValue: number, maxValue: number, ntics = 5): [number, number] {
  const range = maxValue - minValue
  let min = 0
  let max = 0
  // special cases for data range
  if (Math.abs(maxValue) === Math.abs(minValue)) {
    min = -maxValue
    max = maxValue
    return [min, max]
  }

  const inc = range / ntics
  const exp = getExponent(inc)
  const inc2 = Math.ceil(inc / Math.pow(10, exp)) * Math.pow(10, exp)

  // find closest increment to range
  min = Math.floor(minValue / inc2) * inc2
  max = Math.ceil(maxValue / inc2) * inc2

  // TODO: Do we want this behavior?
  // check for special cases where min is zero
  const minMaxLimit = 0.00001
  if (Math.abs(minValue) < minMaxLimit && Math.abs(maxValue) < minMaxLimit) {
    // limit min/max bipolar axes
    min = -minMaxLimit
    max = minMaxLimit
  } else if (minValue >= 0 && maxValue < minMaxLimit) {
    // min value close to 0
    min = 0.0
  } else if (maxValue > -minMaxLimit && maxValue <= 0) {
    // max value close to 0
    max = 0.0
  }

  return [min, max]
}

export function formatAxisLimit(value: number, suffix: string, digits = 3): string {
  if (Math.abs(value) < 0.0000001) {
    return '0' + ' ' + suffix
  }

  const exp = getExponent(Math.abs(value))
  if (Math.abs(exp) > 3 || Math.abs(exp) < -3) {
    return value.toExponential(digits) + ' ' + suffix
  } else {
    return value.toFixed(digits) + ' ' + suffix
  }
}

export function scaleArray(arr: number[], scale: number, min: number, max: number): number[] {
  const range = max - min
  const scaled = arr.map((x) => ((x - min) / range) * scale)
  return scaled
}

export function Extents(x: number[], y: number[]): [number, number, number, number] {
  const xmin = Math.min(...x)
  const xmax = Math.max(...x)
  const ymin = Math.min(...y)
  const ymax = Math.max(...y)
  return [xmin, xmax, ymin, ymax]
}

export function xyToVector(x: number[], y: number[]): Vector2[] {
  const data: Vector2[] = []
  for (let i = 0; i < x.length; i++) {
    data.push(new Vector2(x[i], y[i]))
  }
  return data
}

export function grid2Quad(xoffset: number, gridWidth: number, gridHeight: number, xDivs = 5, yDivs = 5) {
  const gridLines: Float32Array[] = []
  // place central x and y axes first 2 elements of array
  gridLines.push(new Float32Array([xoffset, 0, -gridWidth, xoffset, 0, gridWidth]))
  gridLines.push(new Float32Array([xoffset, 0, 0, xoffset, gridHeight, 0]))

  for (let i = 1; i <= yDivs; i++) {
    gridLines.push(
      new Float32Array([
        xoffset,
        (i * gridHeight) / yDivs,
        -gridWidth,
        xoffset,
        (i * gridHeight) / yDivs,
        gridWidth,
      ])
    )
  }

  for (let i = 1; i <= xDivs; i++) {
    gridLines.push(
      new Float32Array([
        xoffset,
        0,
        (i * gridWidth) / xDivs,
        xoffset,
        gridHeight,
        (i * gridWidth) / xDivs,
      ])
    )
      gridLines.push(
        new Float32Array([
          xoffset,
          0,
          -(i * gridWidth) / xDivs,
          xoffset,
          gridHeight,
          -(i * gridWidth) / xDivs,
        ])
      )
  }
  return gridLines
}

export function genGridLines(xoffset: number, gridWidth: number, gridHeight: number, numDiv = 5) {
  const gridLines: Float32Array[] = []
  // place central x and y axes first 2 elements of array
  gridLines.push(new Float32Array([xoffset, 0, -gridWidth, xoffset, 0, gridWidth]))
  gridLines.push(new Float32Array([xoffset, -gridHeight, 0, xoffset, gridHeight, 0]))

  for (let i = 1; i <= numDiv; i++) {
    gridLines.push(
      new Float32Array([
        xoffset,
        (i * gridHeight) / numDiv,
        -gridWidth,
        xoffset,
        (i * gridHeight) / numDiv,
        gridWidth,
      ])
    )
      gridLines.push(
        new Float32Array([
          xoffset,
          -(i * gridHeight) / numDiv,
          -gridWidth,
          xoffset,
          -(i * gridHeight) / numDiv,
          gridWidth,
        ])
      )
  }

  for (let i = 1; i <= numDiv; i++) {
    gridLines.push(
      new Float32Array([
        xoffset,
        -gridHeight,
        (i * gridWidth) / numDiv,
        xoffset,
        gridHeight,
        (i * gridWidth) / numDiv,
      ])
    )
      gridLines.push(
        new Float32Array([
          xoffset,
          -gridHeight,
          -(i * gridWidth) / numDiv,
          xoffset,
          gridHeight,
          -(i * gridWidth) / numDiv,
        ])
      )
  }
  return gridLines
}

export function genGridLines2(xoffset: number, gridWidth: number, ndivWidth: number, gridHeight: number, ndivHeight: number) {
  const gridLines: Float32Array[] = []
  // place central x and y axes first 2 elements of array
  gridLines.push(new Float32Array([xoffset, 0, -gridWidth, xoffset, 0, gridWidth]))
  gridLines.push(new Float32Array([xoffset, -gridHeight, 0, xoffset, gridHeight, 0]))

  for (let i = 1; i <= ndivWidth; i++) {
    gridLines.push(
      new Float32Array([
        xoffset,
        (i * gridHeight) / ndivWidth,
        -gridWidth,
        xoffset,
        (i * gridHeight) / ndivWidth,
        gridWidth,
      ])
    )
      gridLines.push(
        new Float32Array([
          xoffset,
          -(i * gridHeight) / ndivWidth,
          -gridWidth,
          xoffset,
          -(i * gridHeight) / ndivWidth,
          gridWidth,
        ])
      )
  }

  for (let i = 1; i <= ndivHeight; i++) {
    gridLines.push(
      new Float32Array([
        xoffset,
        -gridHeight,
        (i * gridWidth) / ndivHeight,
        xoffset,
        gridHeight,
        (i * gridWidth) / ndivHeight,
      ])
    )
      gridLines.push(
        new Float32Array([
          xoffset,
          -gridHeight,
          -(i * gridWidth) / ndivHeight,
          xoffset,
          gridHeight,
          -(i * gridWidth) / ndivHeight,
        ])
      )
  }
  return gridLines
}

export function points2ArrayX(x: number, y: number[], z: number[]): [Float32Array, Float32Array] {
  const numPoints = y.length;
  const pluslinesegs = new Float32Array(y.length * 3);
  const neglinesegs = new Float32Array(y.length * 3);
  for (let i = 0; i < numPoints; i++) {
    pluslinesegs[i * 3] = x;
    pluslinesegs[i * 3 + 1] = y[i];
    pluslinesegs[i * 3 + 2] = z[i]; 
    neglinesegs[i * 3] = x; 
    neglinesegs[i * 3 + 1] = -y[i];
    neglinesegs[i * 3 + 2] = z[i]; 
  }
  return [pluslinesegs, neglinesegs]
}

export function pointsToFloat32ArrayX(x: number, y: number[], z: number[]): Float32Array {
  const numPoints = y.length;
  const data = new Float32Array(y.length * 3);
  for (let i = 0; i < numPoints; i++) {
    data[i * 3] = x;
    data[i * 3 + 1] = y[i];
    data[i * 3 + 2] = z[i]; 
  }
  return data
}