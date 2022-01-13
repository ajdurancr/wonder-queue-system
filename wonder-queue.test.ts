import { v4 as uuidV4 } from 'uuid'

import { WonderQueue } from './wonder-queue'

jest.mock('uuid')

uuidV4.mockImplementation(() => {
  return 'test-uuid';
});

const testTimeoout = 1000 * 1 // 5 seconds

describe('WonderQueue', () => {
  let wonderQ;

  beforeEach(() => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-01').getTime())

    wonderQ = new WonderQueue({ timeoutInMs: testTimeoout })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('addMessage method', () => {
    it('should add a messsage with an object and return a messageId', () => {
        const messagePayload = {
            propertyA: 'valueA',
            propB: 'valueB',
            propC: 'valueC'
        }

        const result = wonderQ.addMessage(messagePayload)

        expect(result).toEqual({ messageId: 'test-uuid' })
    })

    it('should add a messsage with a number and return a messageId', () => {
        const messagePayload = 1234

        const result = wonderQ.addMessage(messagePayload)

        expect(result).toEqual({ messageId: 'test-uuid' })
    })
    
    it('should add a messsage with a boolean and return a messageId', () => {
      const messagePayload = 1234

      const result = wonderQ.addMessage(messagePayload)

      expect(result).toEqual({ messageId: 'test-uuid' })
    })
  })

  describe('getMessages method', () => {
    it('should return a list of messages with only 1 element', () => {
      const messagePayload = 'test message'


      wonderQ.addMessage(messagePayload)

      const result = wonderQ.getMessages()

      expect(result).toEqual([
        {
          id: 'test-uuid',
          createdAt: '2020-01-01T00:00:00.000Z',
          lastConsumedAt: null,
          payload: messagePayload
        }
      ])
    })

    it('should return a list of messages with 2 element', () => {
      wonderQ.addMessage('test message 1')
      wonderQ.addMessage('test message 2')

      const result = wonderQ.getMessages(2)

      expect(result.length).toBe(2)
    })

    it('should return a list of messages with 2 elements (available at the moment)', () => {
      wonderQ.addMessage('test message 1')
      wonderQ.addMessage('test message 2')

      const result = wonderQ.getMessages(5)

      expect(result.length).toBe(2)
    })

    it('should return a message that was consumed and re-inserted', async () => {
      const timeout500ms = 500

      wonderQ = new WonderQueue({ timeoutInMs: timeout500ms })

      wonderQ.addMessage('test message 1')

      wonderQ.getMessages() // gets the only message, also sets a timeout500ms timer

      jest.advanceTimersByTime(timeout500ms) // skips the timeout500ms timer

      const result = wonderQ.getMessages() // gets the already consumed message
      
      expect(result.length).toBe(1)

      expect(result[0].lastConsumedAt).not.toBeNull()
    })
  })

  describe('markMessageAsProcessed method', () => {
    it('should mark message as processed', async() => {
      const timeout500ms = 500
      
      wonderQ = new WonderQueue({ timeoutInMs: timeout500ms })

      const { messageId } = wonderQ.addMessage('test message 1')

      wonderQ.getMessages() // gets the only message, also sets a timeout500ms timer

      wonderQ.markMessageAsProcessed(messageId) // deletes the consumed message
      
      jest.advanceTimersByTime(timeout500ms) // skips the timeout500ms timer
      
      const result = wonderQ.getMessages()
      
      expect(result.length).toBe(0) // there are no messages available
    })
  })
})
