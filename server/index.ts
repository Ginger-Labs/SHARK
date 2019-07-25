import * as express from 'express'
import {spawn} from 'child_process'
import * as multer from 'multer'
require('isomorphic-fetch')

const port = 3000
const google = `https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8`
const upload = multer({dest: 'uploads/'})

const app = express()
  .use(express.json())

//the trace is an array of strokes
const defaultStrokes = [
  [ // a stroke is an array of pairs of captured (x, y) coordinates
    [300, 310, 320, 330, 340], // x coordinate
    [320, 320, 320, 320, 320]  // y coordinate
    // each pair of (x, y) coordinates represents one sampling point
  ],
  [
    [320, 320, 320, 320, 320],
    [300, 310, 320, 330, 340]
  ]
]

app.post('/htr', upload.single('image'), async (req, res) => {
  const {file, body} = req
  console.log('body: ', body)
  console.log('file: ', file)
  const {strokes = defaultStrokes, width = 800, height = 800} = body

  if (file) {
    // const command = `cd src/ && python3 --htr='../${file.path}}'`
    // console.log('command: ', command)
    const simpleHTR = spawn('python3', ['src/main.py', `--htr='${file.path}'`])
    simpleHTR.stdout.setEncoding('utf8')
    simpleHTR.stdout.on('data', data => {
      console.log('stdout: ', data)
    })
    simpleHTR.stderr.setEncoding('utf8')
    simpleHTR.stderr.on('data', data => {
      console.log('stderr: ', data)
    })
    simpleHTR.on('close', code => {
      console.log('exited with code: ', code)
    })
  }

  const googleResponse = await fetch(google, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      options: 'enable_pre_space',
      requests: [{
        writing_guide: {
          writing_area_width: width,
          writing_area_height: height
        },
        ink: strokes,
        language: 'en_US'
      }]
    })
  }).then(resp => resp.json())

  if (Array.isArray(googleResponse)) {
    const [code, details] = googleResponse
    console.log('[Google Response]: ', code, details)
  }
  else {
    console.log('[Google Response]: ', googleResponse)
  }

  res.send(googleResponse)
})

app.listen(port, () => console.log(`server running on port ${port}`))
