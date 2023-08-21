import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSupabase } from './SupabaseContext'
import io, { Socket } from 'socket.io-client'
import { NavbarNonHome } from './NavbarNonHome'

interface CompanionChatProps {
  userId: string
  signOut: () => Promise<void>
}

export const CompanionChat: React.FC<CompanionChatProps> = ({
  userId,
  signOut,
}) => {
  const { companionId } = useParams<{ companionId: string }>()
  const [companionName, setCompanionName] = useState<string | null>(null)
  const [companionImage, setCompanionImage] = useState<string | null>(null)
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [chatLog, setChatLog] = useState<string[]>([])
  const [message, setMessage] = useState<string>('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [waitingForReply, setWaitingForReply] = useState(false) // Add this line
  const supabase = useSupabase()
  const navigate = useNavigate()

  const handleEditCompanion = () => {
    navigate(`/edit/${companionId}`)
  }

  useEffect(() => {
    if (!userId) return

    const fetchCompanionDetails = async () => {
      const { data, error } = await supabase
        .from('companions')
        .select('name, image_base64')
        .eq('id', companionId)
        .single()

      if (error) {
        console.error('Error fetching companion details:', error)
      } else if (data) {
        setCompanionName(data.name)
        setCompanionImage(data.image_base64)
      }
    }

    const fetchPastChatLog = async () => {
      const { data, error } = await supabase
        .from('chat_logs')
        .select('user_message, companion_message')
        .eq('companion_id', companionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching past chat log:', error)
      } else if (data) {
        const pastChatLog = data
          .map((log) => [
            `You: ${log.user_message}`,
            `Companion: ${log.companion_message}`,
          ])
          .flat()
        setChatLog(pastChatLog)
      }
    }

    fetchCompanionDetails()
    fetchPastChatLog()

    const socketConnection = io('http://127.0.0.1:8000')
    setSocket(socketConnection)

    socketConnection.emit('start_chat', {
      user_id: userId,
      companion_id: companionId,
    })

    socketConnection.on('session_key', (data: { session_key: string }) => {
      setSessionKey(data.session_key)
    })

    socketConnection.on('receive_message', (data: { message: string }) => {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        `Companion: ${data.message}`,
      ])
      setWaitingForReply(false) // Set to false when a reply is received
    })

    return () => {
      socketConnection.disconnect()
    }
  }, [userId, companionId, supabase])

  const handleSendMessage = () => {
    if (socket) {
      socket.emit('send_message', {
        message: message,
        user_id: userId,
        companion_id: companionId,
      })
      setChatLog((prevChatLog) => [...prevChatLog, `You: ${message}`])
      setMessage('')
      setWaitingForReply(true) // Set to true when a message is sent
    }
  }

  const clearConversation = async () => {
    const { error } = await supabase
      .from('chat_logs')
      .delete()
      .eq('companion_id', companionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing conversation:', error)
    } else {
      setChatLog([])
      if (socket) {
        socket.disconnect()
      }
      navigate('/home')
    }
  }

  return (
    <div className='flex flex-col h-screen bg-gray-100'>
      <NavbarNonHome signOut={signOut} />
      <div className='mx-auto w-full md:w-[800px] p-4 bg-white h-screen'>
        <div className='mb-4 flex space-x-4'>
          <button
            onClick={handleEditCompanion}
            className='text-sm py-1 px-2 bg-blue-500 hover:bg-blue-700 text-white rounded'
          >
            Edit Companion
          </button>
          <button
            onClick={clearConversation}
            className='text-sm py-1 px-2 bg-red-500 hover:bg-red-700 text-white rounded'
          >
            Clear Conversation
          </button>
        </div>
        {companionName && (
          <p className='text-lg mb-2'>You are chatting with {companionName}</p>
        )}
        {companionImage && (
          <img
            src={companionImage}
            alt={`Image of ${companionName}`}
            className='w-32 h-32'
          />
        )}
        <div className='flex-grow overflow-y-auto mb-4 h-80 my-5'>
          {chatLog.map((msg, index) => {
            const colonIndex = msg.indexOf(':')

            const sender = msg.substring(0, colonIndex)
            const content = msg.substring(colonIndex + 1)

            return (
              <div
                key={index}
                className={`text-base mb-2 p-2 rounded-md ${
                  sender === 'You'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <span className='font-semibold'>{sender}:</span>
                {content}
              </div>
            )
          })}
        </div>
        <div className='flex justify-center'>
          <div className='flex space-x-4 items-center w-full sm:w-auto'>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sessionKey ? false : true}
              className='flex-grow w-[500px] sm:min-w-0 p-2 rounded-md border border-gray-300'
            />
            <button
              onClick={handleSendMessage}
              disabled={message.trim() === '' || waitingForReply || !sessionKey} // Disable button when input is empty or waiting for reply
              className={`bg-green-600 text-white p-2 rounded-md hover:bg-green-700 ${
                message.trim() === '' || waitingForReply || !sessionKey
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
