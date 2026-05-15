import express from 'express'
import { GetUser, Login, Register, SearchUserByEmail, BlockUser } from '../controllers/Auth.js'
import { upload } from '../middlewares/Mluter.js'
import { GetChattingUsers } from '../controllers/Message.js'

const AuthRoutes=express.Router()

AuthRoutes.post('/register',upload.single('profile'),Register)
AuthRoutes.post('/login', Login)
AuthRoutes.get('/get_user', GetUser)
AuthRoutes.get('/search', SearchUserByEmail)
AuthRoutes.get('/chatting-users/:userId', GetChattingUsers)
AuthRoutes.post('/block', BlockUser)

console.log("AuthRoutes loaded. Registered routes: /register, /login, /get_user, /search, /chatting-users/:userId, /block");

export default AuthRoutes