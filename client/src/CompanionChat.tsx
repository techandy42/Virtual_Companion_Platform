import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSupabase } from './SupabaseContext'
import io, { Socket } from 'socket.io-client' // Import the Socket type

interface CompanionChatProps {
  userId: string
}

export const CompanionChat: React.FC<CompanionChatProps> = ({ userId }) => {
  const { companionId } = useParams<{ companionId: string }>()
  const [companionName, setCompanionName] = useState<string | null>(null)
  const [companionImage, setCompanionImage] = useState<string | null>(null)
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [chatLog, setChatLog] = useState<string[]>([])
  const [message, setMessage] = useState<string>('')
  const [socket, setSocket] = useState<Socket | null>(null) // Store the socket object in state
  const supabase = useSupabase()

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
    fetchPastChatLog() // Fetch past chat log

    const socketConnection = io('http://127.0.0.1:5000')
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
    }
  }

  return (
    <div>
      <h1>Chat with Companion</h1>
      {companionName && <p>You are chatting with {companionName}</p>}
      {companionImage && (
        <img src={companionImage} alt={`Image of ${companionName}`} />
      )}
      {sessionKey && <p>Session Key: {sessionKey}</p>}
      {chatLog.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
      <input
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={sessionKey ? false : true}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  )
}
