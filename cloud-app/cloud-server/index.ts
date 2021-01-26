/*
  Written By: Collin Lim, 2020

  TODO:
  - Install Swagger
*/

import express from 'express'
import api from './lib/components'

// Initialise express
const app = express()
// Config
const PORT = process.env.PORT || 5000

// For all API calls
app.use('/api', api)
app.get('/', (req, res) => {
  res.send('endpoint reached')
})

// Starting the server
app.listen(PORT, () => console.log(`server started on port ${PORT}`))
