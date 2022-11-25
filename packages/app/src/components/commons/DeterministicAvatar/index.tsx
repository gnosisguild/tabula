import React from "react"
import Sketch from "react-p5"
import p5Types from "p5"
import Random, { genTokenData } from "./utils"
import { Box } from "@mui/material"

interface DeterministicAvatarProps {
  publicationId?: string
  width?: number
  height?: number
}

const DeterministicAvatar: React.FC<DeterministicAvatarProps> = ({ publicationId, width = 160, height = 160 }) => {
  let x: number = 10
  let y: number = 10
  let markingsLayers: number = 0
  let noiseOpacity: number = 1
  let noiseImg: any
  let layers: any[] = []
  let palette: any[] = []
  const strokeColor = [43, 2, 20]
  const divisions = 20

  const publicationHash = publicationId?.replace("P-", "").replace(/(\d)-(\d*)/, "$1")
  const publicationtokenId = publicationId?.match(/(\d)-(\d*)/)
  let tokenData = { hash: publicationHash, tokenId: publicationtokenId && publicationtokenId[2] }
  // const tokenData = genTokenData(123)
  const R = new Random(tokenData)

  for (let i = 0; i < divisions; i++) {
    palette.push([0, 0, 100]) // white
    const newFill = [R.random_num(20, 50), R.random_num(50, 90), R.random_num(50, 90)]
    if (R.random_bool(0.6)) {
      palette.push(newFill) // tint of gold
    }
  }

  function Layer(this: any, size: number, pieces: number, seed: number) {
    this.size = size
    this.pieces = pieces
    this.seed = seed
  }

  function Piece(
    this: any,
    theta: number,
    radius: number,
    rotation: number,
    showCircles: boolean,
    fill: any,
    strokeWeight: number,
    strokeColor: any,
    bool_seeds: number[],
    p5: p5Types,
  ) {
    this.theta = theta
    this.initialRadius = radius
    this.radius = radius
    this.rotation = rotation
    this.initialRotation = rotation
    this.showCircles = showCircles
    this.fill = fill
    this.strokeWeight = strokeWeight
    this.strokeColor = strokeColor
    this.bool_seeds = bool_seeds

    this.render = function () {
      p5.push()
      p5.translate(width / 2, height / 2)
      p5.rotate(this.rotation)
      const x1 = this.radius
      const y1 = 0
      const x2 = this.radius * p5.cos(this.theta)
      const y2 = this.radius * p5.sin(this.theta)
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2
      const d = 2 * p5.abs(p5.sin(this.theta / 2)) * this.radius

      const starPointOffsetRatio = this.bool_seeds[0] ? 0 : 0.1

      p5.noStroke()
      p5.fill(this.fill)
      p5.beginShape()
      p5.vertex(x1, y1)
      p5.vertex(0, 0)
      p5.vertex(x2, y2)
      p5.endShape(p5.CLOSE)

      p5.fill(this.strokeColor)

      p5.strokeWeight(this.strokeWeight)
      if (this.bool_seeds[1]) {
        // p5.line(x1, y1, x2, y2)
        drawBrushLine(x1, y1, x2, y2, 100, this.strokeWeight, 30, p5)
      }
      // p5.line(x1 - x1 * starPointOffsetRatio, y1 - y1 * starPointOffsetRatio, x2 - x2 * 0.65, y2 - y2 * 0.65)
      // p5.line(x2 - x2 * starPointOffsetRatio, y2 - y2 * starPointOffsetRatio, x1 - x1 * 0.65, y1 - y1 * 0.65)
      drawBrushLine(
        x1 - x1 * starPointOffsetRatio,
        y1 - y1 * starPointOffsetRatio,
        x2 - x2 * 0.65,
        y2 - y2 * 0.65,
        100,
        this.strokeWeight,
        30,
        p5,
      )
      drawBrushLine(
        x2 - x2 * starPointOffsetRatio,
        y2 - y2 * starPointOffsetRatio,
        x1 - x1 * 0.65,
        y1 - y1 * 0.65,
        100,
        this.strokeWeight,
        30,
        p5,
      )

      // circle
      if (this.showCircles) {
        p5.noStroke()
        const circleFill = this.fill[3] === 0 ? [this.fill[0], this.fill[1], this.fill[2]] : this.fill
        p5.fill(circleFill)
        p5.circle(cx, cy, d * 0.4)
        p5.noStroke()
        p5.fill(this.strokeColor)
        // p5.circle(cx, cy, d * 0.4)
        drawBrushArc(cx, cy, d * 0.4, this.strokeWeight, 30, p5)
      }
      p5.pop()
    }
  }

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef)
    p5.colorMode(p5.HSB)
    p5.pixelDensity(2)
    p5.angleMode(p5.DEGREES)
    p5.imageMode(p5.CENTER)
    p5.ellipseMode(p5.CENTER)
    markingsLayers = p5.round(R.random_num(2, 6))
    p5.strokeJoin(p5.ROUND)
    initializeMarkings(p5)
    initializeNoiseLayer(p5)
  }

  const draw = (p5: p5Types) => {
    const bgColor = [R.random_num(20, 50), R.random_num(10, 60), R.random_num(90, 100)]
    p5.background(bgColor)
    renderMarkings(p5)
    // drawBrushArc(0,0, width*0.4, 5, 300)
    renderNoise(p5)
    p5.noFill()
    p5.stroke(R.random_choice(palette))
    p5.strokeWeight(8)
    p5.ellipse(0, 0, width, height)
    p5.noLoop()
  }

  const initializeMarkings = (p5: p5Types) => {
    const layerWithCircles = p5.round(R.random_num(0, markingsLayers))
    p5.stroke(43, 2, 20)
    for (let i = 0; i < markingsLayers; i++) {
      const piecesNum = R.random_choice([4, 6, 9, 8, 12, 16])
      const pieces = []
      const fillValue = R.random_choice(palette)
      const transparent = R.random_bool(0.1)
      if (transparent) {
        fillValue.push(0)
      }
      const strokeWeight = p5.round(0.008 * width) //p5.round(R.random_num(width * 0.005, height * 0.01))
      const bool_seeds = [R.random_bool(0.5), R.random_bool(0.93)]
      for (let p = 0; p < piecesNum; p++) {
        const theta = 360 / piecesNum
        pieces.push(
          new (Piece as any)(
            theta, // theta,
            p5.map(i, 0, markingsLayers, width * 0.43, height * 0.05), // radius,
            theta * p, // rotation,
            i === layerWithCircles, // showCircle
            fillValue, // fill
            strokeWeight, // strokeWeight
            strokeColor, // strokeColor
            bool_seeds, // bool_seeds
            p5, // p5
          ),
        )
      }
      layers.push(new (Layer as any)(p5.map(i, 0, markingsLayers, width * 0.43, height * 0.05), pieces))
    }
  }

  const initializeNoiseLayer = (p5: p5Types) => {
    noiseOpacity = R.random_num(0.2, 0.4)
    noiseImg = p5.createGraphics(width, height)
    for (x = 0; x <= width; x++) {
      for (y = 0; y <= height; y++) {
        noiseImg.noStroke()
        noiseImg.fill(p5.map(R.random_dec(), 0, 1, 0, 255))
        noiseImg.circle(x, y, 1)
      }
    }
  }

  const renderMarkings = (p5: p5Types) => {
    layers.forEach((layer: any) => {
      layer.pieces.forEach((piece: any) => {
        piece.render()
      })
    })
    p5.noLoop()
  }

  const renderNoise = (p5: p5Types) => {
    p5.translate(p5.width / 2, p5.height / 2)
    p5.blendMode(p5.HARD_LIGHT)
    p5.tint(255, noiseOpacity)
    p5.image(noiseImg, 0, 0, p5.width, p5.height)
    p5.blendMode(p5.BLEND)
  }

  const drawBrushLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    inc: number,
    size: number,
    variance: number,
    p5: p5Types,
  ) => {
    const stepsBetweenPoints = inc
    const xIncrement = (x2 - x1) / stepsBetweenPoints
    const yIncrement = (y2 - y1) / stepsBetweenPoints

    let currentX = x1
    let currentY = y1

    for (let i = 0; i < stepsBetweenPoints; i++) {
      randomCirclesAroundPoints(currentX, currentY, size, R.random_num(size * variance, size * 2), p5)
      currentX += xIncrement
      currentY += yIncrement
    }
  }

  const randomCirclesAroundPoints = (
    centerX: number,
    centerY: number,
    thickness: number,
    density: number,
    p5: p5Types,
  ) => {
    for (let i = 0; i < density; i++) {
      const rndRadius = R.random_num(0, thickness)
      const rndDegrees = R.random_num(0, 360)
      const x = centerX + rndRadius * p5.cos(rndDegrees)
      const y = centerY + rndRadius * p5.sin(rndDegrees)
      const pointRadius = R.random_num(thickness * 0.05, thickness * 0.2)
      p5.circle(x, y, pointRadius)
    }
  }

  const drawBrushArc = (
    cx: number,
    cy: number,
    d: number,
    stroke: number,
    density: number,
    p5: p5Types,
    start: number = 0,
    stop: number = 360,
  ) => {
    for (let i = start; i < stop; i++) {
      let currentX = (p5.sin(i) * d) / 2
      let currentY = (p5.cos(i) * d) / 2
      randomCirclesAroundPoints(currentX + cx, currentY + cy, stroke, density, p5)
    }
  }

  return (
    <Box sx={{ borderRadius: 999, overflow: "hidden", width: width, height: height }}>
      <Sketch setup={setup} draw={draw} />
    </Box>
  )
}

export default DeterministicAvatar
