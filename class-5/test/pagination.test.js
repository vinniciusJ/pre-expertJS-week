const { describe, it, before, afterEach} = require('mocha')
const { createSandbox } = require('sinon')

const assert = require('assert')

const Pagination = require('../src/pagination')

describe('Pagination tests', () => {
    let sandbox = null

    before(() => {
        sandbox = createSandbox()
    })

    afterEach(() => sandbox.restore())

    describe('#Pagination', () => {
        it('sleep should be a Promise object and not return values', async () => {
            const clock = sandbox.useFakeTimers()
            const time = 1
            const pendingPromise = Pagination.sleep(time)

            clock.tick(time)

            assert.ok(pendingPromise instanceof Promise)

            const result = await pendingPromise

            assert.ok(result === undefined)
        })

        describe('#handleRequest', () => {
            it('should retry a request twice before throwing an exception and validate request params and flow', async () => {
                const expectedCallCount = 2, expectedTimeout = 10
                const pagination = new Pagination()
    
                pagination.maxRetries = expectedCallCount
                pagination.retryTimeout = expectedTimeout
                pagination.maxRequestTimeout = expectedTimeout
    
                const error = new Error('timeout')
    
                sandbox.spy(pagination, pagination.handleRequest.name)
    
                sandbox.stub(Pagination, Pagination.sleep.name).resolves()
    
                sandbox.stub(pagination.request, pagination.request.makeRequest.name).rejects(error)
    
                const dataRequest = { url: 'https://google.com', page: 0 }
    
                await assert.rejects(pagination.handleRequest(dataRequest), error)
    
                assert.deepStrictEqual(pagination.handleRequest.callCount, expectedCallCount)
    
                const { firstArg: firstCallArg } = pagination.handleRequest.getCall(1)
                const { retries: firstCallRetries } = firstCallArg
    
                assert.deepStrictEqual(firstCallRetries, expectedCallCount)
    
                const expectedArgs = {
                    url: `${dataRequest.url}?tid=${dataRequest.page}`,
                    method: 'get',
                    timeout: expectedTimeout
                }
    
                const { args: firstCallArgs } = pagination.request.makeRequest.getCall(0)
    
                assert.deepStrictEqual(firstCallArgs, [expectedArgs])
    
                assert.ok(Pagination.sleep.calledWithExactly(expectedTimeout))
            })
    
            it('should return data from request when succeded', async () => {
                const data = { result: 'ok' }
                const pagination = new Pagination()
                
                sandbox.stub(pagination.request, pagination.request.makeRequest.name).resolves(data)
    
                const result = await pagination.handleRequest({
                    url: 'https://google.com', 
                    page: 1
                })
    
                assert.deepStrictEqual(result, data)
            })
        })

        describe('#getPaginated', () => {
            const responseMock = [
                {
                    "tid": 5705,
                    "date": 1373123005,
                    "type": "sell",
                    "price": 196.52,
                    "amount": 0.01
                },
                {
                    "tid": 5706,
                    "date": 1373124523,
                    "type": "buy",
                    "price": 200,
                    "amount": 0.3
                }
            ]

            it('should update request id on each request', async () => {
                const pagination = new Pagination()

                sandbox.stub(Pagination, Pagination.sleep.name).resolves()
    
                sandbox
                    .stub(pagination, pagination.handleRequest.name)
                    .onCall(0).resolves([responseMock[0]])
                    .onCall(1).resolves([responseMock[1]])
                    .onCall(2).resolves([])

                sandbox.spy(pagination, pagination.getPaginated.name)

                const data = { url: 'www.google.com', page: 1 }

                const secondCallExpected = { ...data, page: responseMock[0].tid }

                const thirdCallExpected = { ...secondCallExpected, page: responseMock[1].tid }

                const getFirstArgFromCall = value => pagination.handleRequest.getCall(value).firstArg

                const gen = pagination.getPaginated(data)

                // Só para pegar as chamadas no assert
                for await (const result of gen){  }

                assert.deepStrictEqual(getFirstArgFromCall(0), data)
                assert.deepStrictEqual(getFirstArgFromCall(1), secondCallExpected)
                assert.deepStrictEqual(getFirstArgFromCall(2), thirdCallExpected)
            })

            it('should stop requesting when request returns an empty array', async () => {
                const expectedThreshold = 20
                const pagination = new Pagination()

                pagination.threshold = expectedThreshold

                sandbox.stub(Pagination, Pagination.sleep.name).resolves()
    
                sandbox
                    .stub(pagination, pagination.handleRequest.name)
                    .onCall(0).resolves([responseMock[0]])
                    .onCall(1).resolves([])
                
                sandbox.spy(pagination, pagination.getPaginated.name)

                const data = { url: 'www.google.com', page: 1 }

                const iterator = await pagination.getPaginated(data)
                const [ firstResult, secondResult ] = await Promise.all([
                    iterator.next(),
                    iterator.next()
                ])

                const expectedFirstCall = { done: false, value: [responseMock[0]] }
                
                assert.deepStrictEqual(firstResult, expectedFirstCall)

                const expectedSecondCall = { done: true, value: undefined }
                
                assert.deepStrictEqual(secondResult, expectedSecondCall)

                assert.deepStrictEqual(Pagination.sleep.callCount, 1)
                assert.ok(Pagination.sleep.calledWithExactly(expectedThreshold))
            })
        })
    })
})