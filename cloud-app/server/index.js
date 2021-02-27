import express from 'express'
import api from './lib/components'

// Initialise express
const app = express()
// Config
const PORT = 5001

// For all API calls
app.use('/api', api)
app.get('/', (req, res) => {
  res.send('Client endpoint reached')
})

// Starting the server
app.listen(PORT, () => console.log(`server started on port ${PORT}`))
