import express from 'express'
import { validateLogin, validateSignup } from '../../util/validation'
const router = express.Router()

router.post('/login', async (req, res) => {
    const  { email, password } = req.body

    const valid = validateLogin(email, password)
})

router.post('/signup', async (req, res) => {
    const  { email, password } = req.body
    const valid = validateSignup(email, password)

})

export default router