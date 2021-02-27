const { describe, it, before, afterEach} = require('mocha')
const { createSandbox } = require('sinon')

const assert = require('assert')
const Events = require('events')

const Request = require('../src/request')

describe('request helpers', () => {
    const timeout = 15
    let sandbox = null, request = null

    before(() => {
        sandbox = createSandbox()
        request = new Request()
    })

    afterEach(() => sandbox.restore())

    it(`should throw an timeout error when the function has spend more than ${timeout}ms`, async () => {
        const exceededTimeout = timeout + 10

        sandbox.stub(request, request.get.name)
            .callsFake(() => new Promise(resolve => setTimeout(resolve, exceededTimeout)))

        const call = request.makeRequest({ url: 'https://www.google.com', method: 'get', timeout })

        await assert.rejects(call, { message: 'timeout at https://www.google.com' })
    })

    it('should return ok when promise time is ok', async () => {
        const expected = { ok: 'ok' }

        sandbox.stub(request, request.get.name)
            .callsFake(async () => {
                await new Promise(resolve => setTimeout(resolve))

                return expected
            })

        const call = () => request.makeRequest({ url: 'https://www.google.com', method: 'get', timeout })

        await assert.doesNotReject(call())
        assert.deepStrictEqual(await call(), expected)
    })

    it('should return a JSON object after a request', async () => {
        const data = [
            Buffer.from('{ "ok": '),
            Buffer.from('"ok"'),
            Buffer.from('}')
        ]

        const responseEvent = new Events()
        const httpsEvent = new Events()

        const https = require('https')

        sandbox
            .stub(https, https.get.name)
            .yields(responseEvent)
            .returns(httpsEvent)

        const expected = { ok: 'ok' }
        const pendingPromise = request.get('https://www.google.com')

        responseEvent.emit('data', data[0])
        responseEvent.emit('data', data[1])
        responseEvent.emit('data', data[2])
        
        responseEvent.emit('end')

        const result = await pendingPromise

        assert.deepStrictEqual(result, expected)
    })
})