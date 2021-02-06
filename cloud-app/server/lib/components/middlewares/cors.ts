import cors from 'cors'
// options for cors midddleware
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization'
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  //   origin: API_URL, (Allow all traffic for now)
  origin: '*',
  preflightContinue: false
}

export const corsImpl = cors(options)
