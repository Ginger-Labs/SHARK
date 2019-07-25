import * as express from 'express'
require('isomorphic-fetch')

const app = express().use(express.json())
const port = 3000
const google = `https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8`

app.get('/detect', async (req, res) => {
  // res.send('hello world!')
  console.log('body: ', req.body)
  const {strokes, width = 800, height = 800} = req.body

  const json = await fetch(google, {
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

  console.log('json: ', json)
  res.send(json)
  // req.
})

app.listen(port, () => console.log(`server running on port ${port}`))
