import express from 'express'
import { DeleteConversation, getMessages, SendMessage } from '../controllers/Message.js'

const MessageRoutes=express.Router()

MessageRoutes.post('/send_message',SendMessage)
MessageRoutes.post('/get_messages', getMessages)
MessageRoutes.delete('/delete/:senderId/:receiverId', DeleteConversation)
export default MessageRoutes