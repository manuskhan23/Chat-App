import ConversationModel from "../models/Converstion.js";
import MessageModel from "../models/Messages.js";
import UserModel from "../models/Auth.js";

export const SendMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;
  
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: `${!senderId ? "Sender Id" : !receiverId ? "Receiver Id" : "Message"} is required.`,
      });
    }
  
    try {
      // Create a new message
      const newMessage = new MessageModel({
        userId: senderId,
        message,
      });
      
      // Save the message first
      const savedMessage = await newMessage.save();
  
      // First try to find an existing conversation
      let conversation = await ConversationModel.findOne({
        members: { 
          $all: [senderId, receiverId],
          $size: 2
        }
      });
  
      if (conversation) {
        // If conversation exists, update it
        conversation = await ConversationModel.findByIdAndUpdate(
          conversation._id,
          {
            $push: { messages: savedMessage._id }
          },
          { new: true }
        );
      } else {
        // If no conversation exists, create a new one
        conversation = await ConversationModel.create({
          members: [senderId, receiverId],
          messages: [savedMessage._id]
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: {
          newMessage: savedMessage,
          conversation: conversation,
        },
      });
    } catch (error) {
      console.error("Message error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send message. Please try again." 
      });
    }
  };
  
export const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.body;
  // console.log('sendia',senderId,'reciverid')
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: `${!senderId ? "Sender Id" : "Receiver Id"} is required.`,
      });
    }

    try {
      // Check if the target user has blocked the sender
      const receiver = await UserModel.findById(receiverId);
      const sender = await UserModel.findById(senderId);

      // Check if receiver has blocked the sender
      const isBlocked = receiver?.blockList?.some(id => id.toString() === senderId);
      const hasBlocked = sender?.blockList?.some(id => id.toString() === receiverId);

      if (isBlocked || hasBlocked) {
        return res.status(403).json({
          success: false,
          message: isBlocked ? "You are blocked by this account." : "You have blocked this user.",
        });
      }

      // Find the conversation
      const conversation = await ConversationModel.findOne({
        members: {
          $all: [senderId, receiverId],
          $size: 2
        }
      }).populate('messages');

      if (!conversation) {
        // Create a conversation shell so it appears in the sidebar list (chatting-users)
        await ConversationModel.create({
          members: [senderId, receiverId],
          messages: [],
        });

        return res.status(200).json({
          success: true,
          message: "Conversation initialized",
          data: [],
        });
      }

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: conversation.messages,
      });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve messages. Please try again."
      });
    }
  };

export const GetChattingUsers = async (req, res) => {
    try {
        const userId = req.params.userId.trim();

        // Find all conversations where the user is a member
        const conversations = await ConversationModel.find({
            members: userId
        }).populate('members');

        // Extract the other member from each conversation safely
        const chattingUsers = conversations.map(conv => {
            return conv.members.find(member => member && member._id.toString() !== userId);
        }).filter(Boolean);

        // Filter out any potential duplicates (e.g., multiple conversation docs for same pair)
        const uniqueUsers = chattingUsers.filter((user, index, self) =>
            index === self.findIndex((t) => t._id.toString() === user._id.toString())
        );

        res.status(200).json({ success: true, users: uniqueUsers });
    } catch (error) {
        console.error("Get chatting users error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const DeleteConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        
        // Find conversation first to get message IDs
        const conversation = await ConversationModel.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (conversation) {
            // Delete all messages belonging to this conversation
            await MessageModel.deleteMany({ _id: { $in: conversation.messages } });
            await ConversationModel.findByIdAndDelete(conversation._id);
        }

        res.status(200).json({ success: true, message: "Chat removed successfully" });
    } catch (error) {
        console.error("Delete conversation error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};