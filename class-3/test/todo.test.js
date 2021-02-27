const { describe, it, beforeEach, afterEach } = require('mocha')
const { expect } = require('chai')
const { createSandbox } = require('sinon')

const Todo = require('../src/todo')

describe('todo', () => {
    let sandbox = null
    
    beforeEach(() => {
        sandbox = createSandbox()
    })

    afterEach(() => sandbox.restore())

    describe('#isValid', () => {
        it('should return invalid when creating an object withou text', () => {
            const data = { text: '', when: new Date('2020-02-26') }

            const todo = new Todo(data)
            const result = todo.isValid()

            expect(result).to.be.not.ok
        })

        it('should return invalid when creating an object using "when" property is invalid', () => {
            const data = { text: 'Hello world', when: new Date('20-02-26') }

            const todo = new Todo(data)
            const result = todo.isValid()

            expect(result).to.be.not.ok
        })

        it('should have "id", "text", "when", and "status" properties after creating an object', () => {
            const data = { text: 'Hello world', when: new Date('2020-02-26') }

            const expectedID = '00001'
            const expectedItem = {
                text: data.text,
                when: data.when,
                status: '',
                id: expectedID
            }

            const fakeUUID = sandbox.fake.returns(expectedID)

            const uuid = require('uuid')

            sandbox.replace(uuid, 'v4', fakeUUID)

            const todo = new Todo(data)
            const result = todo.isValid()

            expect(uuid.v4.calledOnce).to.be.ok
            expect(todo).to.be.deep.equal(expectedItem)
            expect(result).to.be.ok
        })
    })
})