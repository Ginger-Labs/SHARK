import * as express from 'express'

const app = express()
const port = 3000

app.get('/detect', (req, res) => {
  res.send('hello world!')
})

app.listen(port, () => console.log(`server running on port ${port}`))
