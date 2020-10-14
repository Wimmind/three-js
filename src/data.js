const textures = [
  {
    id: 1,
    src: "pano_1.png",
    coords: {
      x: 0,
      y: 0,
      z: 0
    },
    siblings: [2,3]
  },
  {
    id: 2,
    src: "pano_2_1.png",
    coords: {
      x: 2,
      y: 0,
      z: 1
    },
    siblings: [1,3,4]
  },
  {
    id: 3,
    src: "pano_2_2_1.png",
    coords: {
      x: 1,
      y: 0,
      z: 3
    },
    siblings: [1,2,4,5]
  },
  {
    id: 4,
    src: "pano_2_2.png",
    coords: {
      x: 3,
      y: 0,
      z: 3
    },
    siblings: [2,3,5,7]
  },
  {
    id: 5,
    src: "pano_2.png",
    coords: {
      x: 2,
      y: 0,
      z: 6
    },
    siblings: [3,4,6]
  },
  {
    id: 6,
    src: "pano_3.png",
    coords: {
      x: 4,
      y: 0,
      z: 7
    },
    siblings: [5,7]
  },
  {
    id: 7,
    src: "pano_4_1.png",
    coords: {
      x: 5,
      y: 0,
      z: 5
    },
    siblings: [4,6,8]
  },
  {
    id: 8,
    src: "pano_4.png",
    coords: {
      x: 6,
      y: 0,
      z: 2
    },
    siblings: [4,7]
  }
]

export default textures;