export function getUnicVector(currentCoords, siblingCoords) {
  const vec = {
    x: (siblingCoords.x - currentCoords.x),
    y: (siblingCoords.y - currentCoords.y),
    z: (siblingCoords.z - currentCoords.z)
  }
  const len_vec = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
  return {
    x: vec.x / len_vec,
    y: vec.y / len_vec,
    z: vec.z / len_vec
  }
}

export function rotationMatrix({ x, y, z }, angle) {
  const cs = Math.cos(angle);
  const sn = Math.sin(angle);
  return {
    x: (x * cs - z * sn),
    y: y,
    z: (x * sn + z * cs)
  }
}

export function resizeTriangle(point, x0, z0) {
  const k = 1 / 5;
  return {
    x: x0 + k * (point.x - x0),
    z: z0 + k * (point.z - z0)
  }
}


export function findAnglesAndCoords({ x, y, z }) {

  // x = -498;
  // z = 23;

  const delta = 500;

  const phi = Math.acos(y)
  const theta = Math.acos(x / (delta * Math.sin(phi)));
  const lon = theta * (180 / Math.PI);
  const lat = 90 - phi * (180 / Math.PI);

  return {
    phi, theta, lon, lat
  }
}
