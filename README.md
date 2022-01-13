# WonderQ
A simple queuing system

## Description

WonderQ is a broker that allows producers to write to it, and consumers to read from it. It runs on a single server and has a single in-memory message queue.

### Features
- Producers are able to **add messages** to the queue.
- Consumers are able to **read messages** from the queue and **mark messages as read** (processed).

### Tech Stack

- [Fastify](https://www.fastify.io/)
- [Fastify Swagger](https://github.com/fastify/fastify-swagger)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)

## Getting started

### Prerequisites

- `Node >=16.13.0`

### Install

1. Clone the repository

```sh
git clone https://github.com/ajdurancr/wonder-queue-system.git
```

2. Install npm packages

```sh
npm install
```

3. Run the project

```sh
npm start
```

### Configuration
In order for you to configure the queuing system, you can use the following environment variables:
- `TIMEOUT_IN_MS`: Timeout in milliseconds that a given message will be in consumed status. After this time, the message will be re-inserted into the queue so it becomes available to any consumer requesting again. Default value: `300000` (*5 minutes*).
- `PORT`: The port our server will be listening to. Default value: `8080`.

You can use the `.env` file to add your environment variables in development. Please also see the `.env.example` file for reference.

### File Structure
```
/
├── .env
├── .env.example
├── .gitignore
├── .nvmrc
├── jest.config.ts
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
├── wonder-queue.test.ts
└── wonder-queue.ts
```


### Usage

After starting the project, you will be able to make requests to your local instance of WonderQ on `http://localhost:8080`.

#### Adding a message to WonderQ
As a producer, you will be able to write to WonderQ, which will return a message ID as confirmation:
```sh
curl -X 'POST' \
  'http://localhost:8080/message' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '"this is a test message"'
```

```sh
// 200 response
{
  "messageId": "5169aa17-b9fc-4d23-8100-2f5e4836f61d"
}
```

#### Getting messages from WonderQ
As a consumer, you will be able to poll WonderQ for new messages. You can ask for a fixed amount of messages which will be returned if available:
```sh
curl -X 'GET' \
  'http://localhost:8080/message?total=3' \
  -H 'accept: application/json'
```


```sh
// 200 response
[
  {
    "id": "5169aa17-b9fc-4d23-8100-2f5e4836f61d",
    "createdAt": "2022-01-13T05:13:57.732Z",
    "lastConsumedAt": "",
    "payload": "this is a test message"
  },
  {
    "id": "46efd5f8-78c4-46a5-bf12-d2b4b5342dbc",
    "createdAt": "2022-01-13T05:22:35.612Z",
    "lastConsumedAt": "",
    "payload": 1234
  },
  {
    "id": "985661d5-22ca-4d31-929d-1855711d4074",
    "createdAt": "2022-01-13T05:23:23.412Z",
    "lastConsumedAt": "",
    "payload": {
      "testProperty": "test value"
    }
  }
]
```

If `total` argument is not provided, only 1 message will be returned (when available):
```sh
curl -X 'GET' \
  'http://localhost:8080/message' \
  -H 'accept: application/json'
```


```sh
// 200 response
[
  {
    "id": "5169aa17-b9fc-4d23-8100-2f5e4836f61d",
    "createdAt": "2022-01-13T05:13:57.732Z",
    "lastConsumedAt": "2022-01-13T05:23:46.783Z",
    "payload": "this is a test message"
  }
]
```

> Please note that the message was assigned a value for the `lastConsumedAt` property since it was already consumed but it was not marked as read (processed) within the configured amount of time.

#### Marking a message as read (processed)
As a consumer, you will also be able to mark a message as read:
```sh
curl -X 'POST' \
  'http://localhost:8080/message/processed' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "messageId": "5169aa17-b9fc-4d23-8100-2f5e4836f61d"
}'
```


```sh
// 200 response
true
```

**Find out more in:** `http://localhost:8080/documentation`

### To-do
- [x] Swagger Docs
- [ ] Add eslint 
- [ ] Add prettier
- [ ] Add Husky for git hooks

### License

This project is licensed under the [MIT License](/LICENSE).