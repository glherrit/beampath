import type { Object3D } from "three";

export function getMeshIndex(e: MouseEvent, type: string) {
  if (Object.keys(e).includes('object')) {
    const objInfo = e['object' as keyof MouseEvent] as unknown as Object3D;
    if (Object.keys(objInfo).includes('name')) {
      const name = objInfo['name' as keyof Object3D] as unknown as string;
      if (name.includes(type)) {
        return parseInt(name.replace(type, ''));
      }
    }
  }
  return -1;
}

export function getExtraKeyInfo(e: MouseEvent, type: string) {
  if (Object.keys(e).includes('nativeEvent')) {
    const objInfo = e['nativeEvent' as keyof MouseEvent] as unknown as Object3D;
    const isKey = objInfo[type as keyof Object3D] as boolean;
    return isKey;
  }
  return false;
}

export function centerLine(lineseg: Float32Array, yoffset: number): [number, number, number] {
  const center = lineseg.length / 3 / 2;
  const centerIndex = Math.floor(center);
  return [
    lineseg[centerIndex * 3],
    lineseg[centerIndex * 3 + 1] + yoffset,
    lineseg[centerIndex * 3 + 2]
  ];
}



