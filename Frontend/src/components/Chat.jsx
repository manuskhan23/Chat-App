import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Baseurl } from '../../services api/baseurl';
import { IoIosSend } from 'react-icons/io';


export const Chat = ({socket}) => {
  const { selectedUser } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [messagesend, setMessagesend] = useState(false);
  
  const ScrollRef = useRef();
  const inputvalue = useRef();

  useEffect(() => {
    const getMessages = async () => {
      if (!user?._id || !selectedUser?._id) return;

      try {
        const senderdata = {
          senderId: user._id,
          receiverId: selectedUser._id,
        };
        const res = await axios.post(`${Baseurl}/api/messages/get_messages`, senderdata);
        const data = res.data;
        setMessages(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]); // Clear messages on error
      }
    };

    if (user && selectedUser) {
      getMessages();
    }
  }, [selectedUser, user, messagesend]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (newMessage) => {
        if (newMessage.userId === selectedUser?._id) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });
    }
    return () => {
      if (socket) socket.off('receiveMessage');
    };
  }, [socket, selectedUser]);
  

  const handlemessaage = async () => {
    if (!selectedUser || !selectedUser._id) {
      console.log('No user selected');
      return;
    }

    try {
      const messagedata = {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: inputvalue.current.value,
      };
   
      // Emit message via Socket.IO
      socket.emit('sendMessage', { messagedata });
      const UpdateMessage={
        userId:user._id,
        message:inputvalue.current.value,
        time:Date.now()
      }
      setMessages((prevMessages) => (Array.isArray(prevMessages) ? [...prevMessages, UpdateMessage] : [UpdateMessage]));

      // Save message to the database
      await axios.post(`${Baseurl}/api/messages/send_message`, messagedata);
      // setMessagesend((prev) => !prev);
      inputvalue.current.value = '';
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (ScrollRef.current) {
      ScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col">
      {!selectedUser ? (
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-700 bg-white px-6 py-3 rounded-lg shadow-md">
            Get Started by Selecting a User
          </h1>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="w-full sticky top-0 z-10 flex justify-between items-center py-2 px-4 bg-[#F0F2F5] shadow-md">
            <div className="flex gap-[10px] items-center">
              <img
                src={selectedUser.profile}
                alt="Profile"
                className="ml-[13px] rounded-[50%] w-[50px] h-[50px] object-cover"
              />
              <div>
                <h3 className='text-[20px]'>{selectedUser.name}</h3>
                {/* <span className="flex">online</span> */}
              </div>
            </div>
            <div className="flex gap-[15px] flex-shrink-0">
              
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 relative mt-[65px]">
            {messages && Array.isArray(messages) && messages.map((message) => (
              <div key={message._id || message.time || Math.random()} ref={ScrollRef}>
                <div
                  className={`${
                    message.userId === user._id ? 'chat chat-end ml-3' : 'chat chat-start'
                  }`}
                >
                  <div
                    className={`${
                      message.userId === user._id
                        ? 'chat-bubble bg-green-200 text-black'
                        : 'chat-bubble bg-white text-black'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex items-center px-4 py-2 sticky bottom-0 bg-gray-100 rounded-[10px]">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full px-3 py-2 bg-[#EEEEF8] text-gray-800 rounded-md pr-[120px]"
                ref={inputvalue}
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[25px] px-4 py-1 text-black rounded-md"
                title="Send Message"
                onClick={handlemessaage}
              >
                <IoIosSend />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
