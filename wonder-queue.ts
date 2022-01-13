import { v4 as uuidV4 } from 'uuid'

type Message = {
  id: string
  createdAt: string
  lastConsumedAt: string | null
  payload: any
}

type ConsumedMessage = {
  timeoutId: NodeJS.Timeout,
  message: Message
}

type ConsumedMessageMap = { [key: string]: ConsumedMessage }

type WonderQueueOptions = {
  timeoutInMs?: number
}

const defaultTimeout = 1000 * 60 * 5 // 5 minutes

class WonderQueue {
  private timeoutInMs: number

  private messageQueue: Message[] = []

  private consumedMessages: ConsumedMessageMap = {}

  constructor(opts: WonderQueueOptions = {}) {
    this.timeoutInMs = opts.timeoutInMs || defaultTimeout
  }

  addMessage(payload: any) {
    const messageId = uuidV4()

    this.messageQueue.push({
      id: messageId,
      createdAt: new Date().toISOString(),
      lastConsumedAt: null,
      payload,
    })

    return { messageId }
  }

  private deleteConsumedMessage(messageId: string): boolean {
    if(!this.consumedMessages[messageId]) return false
    
    delete this.consumedMessages[messageId]

    return true
  }

  getMessages(total: number = 1): Message[] {
    const consumedMessages = this.messageQueue.splice(0, total)
    
    if(consumedMessages.length) {
      this.markMessageAsConsumed(consumedMessages)
    }

    return consumedMessages
  }

  private reInsertConsumedMessage(message: Message): void {
    const { id: messageId } = message
    const {
      [messageId]: consumedMessage
    } =  this.consumedMessages

    if(!consumedMessage) return // it was already re-inserted into the queue or deleted

    this.deleteConsumedMessage(messageId)
    
    this.messageQueue.push(message)
  }

  private markMessageAsConsumed(messages: Message[]) {
    const lastConsumedAt = new Date().toISOString()

    messages.forEach((message) => {
      const consumedMessage: Message = {
        ...message,
        lastConsumedAt,
      }

      const timeoutId = setTimeout(() => {
        this.reInsertConsumedMessage(consumedMessage)
      }, this.timeoutInMs)

      this.consumedMessages[message.id] = {
        timeoutId,
        message: consumedMessage,
      }
    })
  }

  markMessageAsProcessed(messageId: string): boolean {
    return this.deleteConsumedMessage(messageId)
  }
}

/*
I'm using a named export because I think that for this particular use case,
it would be much easier to track where this module will be used and 
might be updated due to future changes
*/
export { WonderQueue }