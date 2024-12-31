import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import {formatMessageTime} from '../lib/utils';
import MessageSkeleton  from './skeletons/MessageSkeleton';
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
const ChatContainer = () =>{
  const {messages,getMessages, isMessagesLoading,selectedUser,subscribeToMessages,unsubscribeFromMessages} = useChatStore();
    useEffect(()=>{
       getMessages(selectedUser._id);

       subscribeToMessages();
       return()=> unsubscribeFromMessages();
    },[selectedUser._id,getMessages,subscribeToMessages,unsubscribeFromMessages]);

  const {authUser} = useAuthStore()
  const messageEndRef = useRef(null);

  useEffect(()=>{
    if(messageEndRef.current && messages){
    messageEndRef.current.scrollIntoView({behavior:"smooth"});
 }
 },[messages])

   if(isMessagesLoading) return (
    <div  className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader/>
        <MessageSkeleton/>
        <MessageInput/>
    </div>
   )
    
   return(
    <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader/>

        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
         {messages.map((message)=>{
          <div key={message._id}
          ref={messageEndRef}
          className={`chat ${message.senderId===authUser._id ? "chat-end":"chat-start"}`} >
            <div className='chat-image avatar'>
                <div className='size-10 rounded-full border'>
                  <img 
                   src={message.senderId===authUser._id ? authUser.profile || "/avatar.png" : selectedUser.profile || "/avatar.png"} 
                    alt="profile pic"/>
                  </div>
              </div>
              <div className='chat-header mb-1'>
                <time className='text-xs opacity-50 ml-1'>
                  {formatMessageTime(message.createdAt)}
                </time>
                </div>
                <div class="chat-bubble flex">
                  {message.image && (
                    <img src={message.image}
                    alt="Attachment"
                    className='sm:max-w-[200px] rounded-md mb-2'
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  </div>
          </div>
         })}  
        </div>        
       <MessageInput />
    </div>
   )


}
export default ChatContainer;