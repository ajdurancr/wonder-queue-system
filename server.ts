import { Server, IncomingMessage, ServerResponse } from 'http'
import fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import fastifySwagger from 'fastify-swagger'

import { WonderQueue } from './wonder-queue'
import pkgJson from './package.json'

const PORT = process.env.PORT || 8080

const wonderQ = new WonderQueue({
  timeoutInMs: 1000 * 15, // 15 seconds
})


interface GetMessageQuerystring {
  total?: number;
}

interface AddMessageBody {
  payload: any
}

interface MarkMessageAsProcessedBody {
  messageId: string
}

const server: FastifyInstance<
   Server,
   IncomingMessage,
   ServerResponse
> = fastify({ logger: true });

server.register(fastifySwagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'WonderQ',
      description: 'A simple queuing system',
      version: pkgJson.version
    },
    externalDocs: {
      url: 'https://github.com/ajdurancr/wonder-queue-system',
      description: 'Find more info here'
    },
    host: `localhost:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'consumer', description: 'Consumer related endpoints' },
      { name: 'producer', description: 'Producer related endpoints' }
    ],
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true
})

server.addSchema({ $id: 'Payload' })

server.addSchema({
  $id: 'Message',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid'
    },
    createdAt: {
      type: 'string'
    },
    lastConsumedAt: {
      type: 'string'
    },
    payload: {
      $ref: 'Payload#'
    }
  }
})

const getMessageOpts: RouteShorthandOptions = {
  schema: {
    tags: ['consumer'],
    querystring: {
      total: {
        type: 'number'
      }
    },
    response: {
      200: {
        type: 'array',
        items: {
          $ref: "Message#"
        }
      },
      400: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', default: 400 },
          code: { type: 'string' },
          error: { type: 'string', default: "Bad Request" },
          message: { type: 'string' },
        }
      }
    }
  }
};

server.get<{
  Querystring: GetMessageQuerystring
}>('/message', getMessageOpts, (request, reply) => {
  const result = wonderQ.getMessages(request.query.total)

  reply.code(200).send(result);
});

// Define our route options with schema validation
const addMessageOpts: RouteShorthandOptions = {
  schema: {
    tags: ['producer'],
    body: {
      $ref: 'Payload#',
    },
    response: {
      200: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            format: 'uuid'
          },
        },
      },
      400: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', default: 400 },
          code: { type: 'string' },
          error: { type: 'string', default: "Bad Request" },
          message: { type: 'string' },
        }
      }
    },
  },
};

server.post<{
  Body: AddMessageBody
}>('/message', addMessageOpts, (request, reply) => {
  const result = wonderQ.addMessage(request.body)

  reply.code(200).send(result);
});
 
const markMessageAsProcessedOpts: RouteShorthandOptions = {
  schema: {
    tags: ['consumer'],
    body: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string'
        }
      },
    },
    response: {
      200: {
         type: 'boolean',
      },
      400: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', default: 400 },
          code: { type: 'string' },
          error: { type: 'string', default: "Bad Request" },
          message: { type: 'string' },
        }
      },
      404: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', default: 404 },
          code: { type: 'string', default: 'NOT_FOUND' },
          error: { type: 'string', default: "Message Not Found." },
          message: { type: 'string', default: 'Could not mark message as processed.' },
        }
      }
    }
  }
};

server.post<{
 Body: MarkMessageAsProcessedBody
}>('/message/processed', markMessageAsProcessedOpts, (request, reply) => {
  const deleted = wonderQ.markMessageAsProcessed(request.body.messageId)

  if(!deleted) {
    reply.code(404).send({
      statusCode: 404,
      code: 'NOT_FOUND',
      error: "Message Not Found.",
      message: "Could not mark message as processed.",
    });
  }

  reply.code(200).send(true);
});

 // Start your server
 server.listen(8080, (err, address) => {
   if (err) {
     console.error(err);
     process.exit(1);
   }
 });