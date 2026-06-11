import { Router } from 'express'
import {loginUser,registerUser} from '../controller/userAuthentication.js'

const authRouter= Router();

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
export default authRouter