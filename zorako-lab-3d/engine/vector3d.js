/**
 * ZORAKO HIGH-PERFORMANCE 3D LINEAR ALGEBRA ENGINE
 * Zero-Allocation, TypedArray-Backed Spatial Vector & Matrix System
 * Optimized for Engine Micro-benchmarks & TCAD Spatial Solvers
 */

export class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.elements = new Float64Array(3);
    this.elements[0] = x;
    this.elements[1] = y;
    this.elements[2] = z;
  }

  get x() { return this.elements[0]; }
  set x(val) { this.elements[0] = val; }

  get y() { return this.elements[1]; }
  set y(val) { this.elements[1] = val; }

  get z() { return this.elements[2]; }
  set z(val) { this.elements[2] = val; }

  set(x, y, z) {
    this.elements[0] = x;
    this.elements[1] = y;
    this.elements[2] = z;
    return this;
  }

  copy(v) {
    this.elements[0] = v.elements[0];
    this.elements[1] = v.elements[1];
    this.elements[2] = v.elements[2];
    return this;
  }

  clone() {
    return new Vector3D(this.elements[0], this.elements[1], this.elements[2]);
  }

  // --- ARITHMETIC (ZERO ALLOCATION TARGET PASSING) ---

  add(v, out = this) {
    out.elements[0] = this.elements[0] + v.elements[0];
    out.elements[1] = this.elements[1] + v.elements[1];
    out.elements[2] = this.elements[2] + v.elements[2];
    return out;
  }

  sub(v, out = this) {
    out.elements[0] = this.elements[0] - v.elements[0];
    out.elements[1] = this.elements[1] - v.elements[1];
    out.elements[2] = this.elements[2] - v.elements[2];
    return out;
  }

  mulScalar(scalar, out = this) {
    out.elements[0] = this.elements[0] * scalar;
    out.elements[1] = this.elements[1] * scalar;
    out.elements[2] = this.elements[2] * scalar;
    return out;
  }

  divScalar(scalar, out = this) {
    if (scalar === 0) throw new Error("[Vector3D] Division by zero error.");
    const inv = 1.0 / scalar;
    out.elements[0] = this.elements[0] * inv;
    out.elements[1] = this.elements[1] * inv;
    out.elements[2] = this.elements[2] * inv;
    return out;
  }

  // --- VECTOR VECTOR PRODUCTS ---

  dot(v) {
    return (
      this.elements[0] * v.elements[0] +
      this.elements[1] * v.elements[1] +
      this.elements[2] * v.elements[2]
    );
  }

  cross(v, out = this) {
    const ax = this.elements[0], ay = this.elements[1], az = this.elements[2];
    const bx = v.elements[0], by = v.elements[1], bz = v.elements[2];

    out.elements[0] = ay * bz - az * by;
    out.elements[1] = az * bx - ax * bz;
    out.elements[2] = ax * by - ay * bx;
    return out;
  }

  // --- GEOMETRIC METRICS & TRANSFORMS ---

  lengthSq() {
    const x = this.elements[0], y = this.elements[1], z = this.elements[2];
    return x * x + y * y + z * z;
  }

  length() {
    return Math.sqrt(this.lengthSq());
  }

  normalize(out = this) {
    const len = this.length();
    if (len === 0) {
      out.set(0, 0, 0);
      return out;
    }
    return this.divScalar(len, out);
  }

  distanceTo(v) {
    const dx = this.elements[0] - v.elements[0];
    const dy = this.elements[1] - v.elements[1];
    const dz = this.elements[2] - v.elements[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  lerp(v, t, out = this) {
    out.elements[0] = this.elements[0] + (v.elements[0] - this.elements[0]) * t;
    out.elements[1] = this.elements[1] + (v.elements[1] - this.elements[1]) * t;
    out.elements[2] = this.elements[2] + (v.elements[2] - this.elements[2]) * t;
    return out;
  }

  toArray() {
    return [this.elements[0], this.elements[1], this.elements[2]];
  }
}

/**
 * High-Performance 4x4 Spatial Transformation Matrix
 */
export class Matrix4 {
  constructor() {
    this.elements = new Float64Array(16);
    this.identity();
  }

  identity() {
    this.elements.fill(0);
    this.elements[0] = 1;
    this.elements[5] = 1;
    this.elements[10] = 1;
    this.elements[15] = 1;
    return this;
  }

  multiplyVector3(v, out = new Vector3D()) {
    const e = this.elements;
    const x = v.x, y = v.y, z = v.z;
    const w = 1.0 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    out.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    out.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    out.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
    return out;
  }
}
