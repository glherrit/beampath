
import { Matrix2D } from "$lib/math/gcomplex";

export class GaussClass {
  type: "distance" | "lens";
  value: number;
  index: number;
  color: string;
  tag: boolean;
  constructor(
    type: "distance" | "lens",
    value: number = 100,
    index: number = 1,
    color = "lightblue",
    tag = false
  ) {
    this.type = $state(type);
    this.value = $state(value);
    this.index = $state(index);
    this.color = $state(color);
    this.tag = $state(tag);
  }

  clone() {
    return new GaussClass(this.type, this.value, this.index, this.color, this.tag)
  }

  toString() {
    return `GaussClass { type: ${this.type}, value: ${this.value}, index: ${this.index}, color: ${this.color}, tag: ${this.tag} }`;
  }

  toMatrix2D() {
    switch (this.type) {
      case "distance":
        return new Matrix2D(1, this.value, 0, 1)
      case "lens":
        return new Matrix2D(1, 0, -1 / this.value, 1)
      default:
        return new Matrix2D(1, 0, 0, 1)
    }
  }
}

export function combineAdjacentDistances(gaussOps: GaussClass[]): void {
  const adjops: number[] = []
  for (let i = 0; i < gaussOps.length - 1; i++) {
    if (gaussOps[i].type === "distance" && gaussOps[i + 1].type === "distance") {
      adjops.push(i)
    }
  }
  if (adjops.length === 0) return
  // remove them in reverse order
  for (let i = adjops.length - 1; i >= 0; i--) {
    const index = adjops[i]
    gaussOps[index].value += gaussOps[index + 1].value
    gaussOps.splice(index + 1, 1)
  }
}

export function distanceTo(gops: GaussClass[], index: number): number {
  let dist = 0
  for (let i = 0; i < index; i++) {
    if (gops[i].type === "distance") {
      dist += gops[i].value
    }
  }
  return dist
}

export function findIndex(gops: GaussClass[], z: number): number {
  let index = -1
  let A = 0
  for (let i = 0; i < gops.length; i++) {
    if (gops[i].type === "distance") {
      const B = A + gops[i].value
      if (z > A && z < B) {
        index = i
        break
      } else {
        A += gops[i].value
      }
    }
  }
  return index
}

export function addLens(gops: GaussClass[], trackz: number): void {
  const newIndex = findIndex(gops, trackz)
  const dsum = gops[newIndex].value
  gops[newIndex].value = trackz - distanceTo(gops, newIndex)
  gops.splice(newIndex + 1, 0, new GaussClass("lens", 3000, 1, "blue"))
  gops.splice(newIndex + 2, 0, new GaussClass("distance", dsum - gops[newIndex].value))
}
