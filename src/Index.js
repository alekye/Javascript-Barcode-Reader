const BAR_SET = {
  '10001': '1',
  '01001': '2',
  '11000': '3',
  '00101': '4',
  '10100': '5',
  '01100': '6',
  '00011': '7',
  '10010': '8',
  '01010': '9',
  '00110': '10',
}

const GROUP_SET = {
  '01000': '0',
  '00100': '10',
  '00010': '20',
  '10000': '30',
}

const CHAR_SET = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '-',
  '.',
  '␣',
  '*',
]

const barcodeDecoder = (imgOrId, options) => {
  const doc = document
  const img =
    typeof imgOrId === 'object' ? imgOrId : doc.getElementById(imgOrId)
  const width = img.naturalWidth
  const height = img.naturalHeight

  const canvas = doc.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  console.log(options)

  // check points for barcode location
  const spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5]
  let numLines = spoints.length
  const slineStep = height / (numLines + 1)

  ctx.drawImage(img, 0, 0)

  // eslint-disable-next-line
  while ((numLines -= 1)) {
    // create section of height 2
    const pxLine = ctx.getImageData(0, slineStep * spoints[numLines], width, 2)
      .data
    const sum = []
    let min = 0
    let max = 0

    // grey scale section and sum of columns pixels in section
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const i = (row * width + col) * 4
        const g = (pxLine[i] * 3 + pxLine[i + 1] * 4 + pxLine[i + 2] * 2) / 9
        const s = sum[col]

        pxLine[i] = g
        pxLine[i + 1] = g
        pxLine[i + 2] = g

        sum[col] = g + (s === undefined ? 0 : s)
      }
    }

    for (let i = 0; i < width; i += 1) {
      sum[i] /= 2
      const s = sum[i]

      if (s < min) {
        min = s
      }
      if (s > max) {
        max = s
      }
    }

    // matches columns in two rows
    const pivot = min + (max - min) / 2
    const bmp = []

    for (let col = 0; col < width; col += 1) {
      let matches = 0
      for (let row = 0; row < 2; row += 1) {
        if (pxLine[(row * width + col) * 4] > pivot) {
          matches += 1
        }
      }
      bmp.push(matches > 1)
    }

    // matches width of barcode lines
    let curr = bmp[0]
    let count = 1
    const lines = []

    for (let col = 0; col < width; col += 1) {
      if (bmp[col] === curr) {
        count += 1
      } else {
        lines.push(count)
        count = 1
        curr = bmp[col]
      }
    }

    // manualy push last white space
    lines.push(3)
    let code = ''

    for (let i = 1; i < lines.length; i += 10) {
      const segment = lines.slice(i, i + 10)

      const barThreshold = Math.round(
        segment.reduce((pre, item) => pre + item, 0) / segment.length
      )

      const noob = segment.map(item => (item > barThreshold ? 1 : 0))
      const barSeg = noob.filter((item, index) => index % 2 === 0).join('')
      const whiteSeg = noob.filter((item, index) => index % 2 !== 0).join('')

      code +=
        CHAR_SET[
          parseInt(BAR_SET[barSeg], 10) - 1 + parseInt(GROUP_SET[whiteSeg], 10)
        ]
    }

    return code.substring(1, code.length - 1)
  }
  return false
}

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = barcodeDecoder
    module.exports = barcodeDecoder
  }
  exports.barcodeDecoder = barcodeDecoder
} else {
  root.barcodeDecoder = barcodeDecoder
}
