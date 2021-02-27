const assert = require('assert')
const Employee = require('./employee')
const Manager = require('./manager')
const Util = require('./util')

const GENDER = {
    male: 'male',
    female: 'female'
}

{
    const employee = new Employee({
        name: 'Vinicius',
        gender: GENDER.male,
    })

    assert.throws(() => employee.birthYear, { message: 'You must define age first!' })
}

const CURRENT_YEAR = 2021

Date.prototype.getFullYear = () => CURRENT_YEAR

{
    const employee = new Employee({
        name: 'Koly',
        age: 18,
        gender: GENDER.female,
    })

    assert.deepStrictEqual(employee.name, 'Ms. Koly')
    assert.deepStrictEqual(employee.age, undefined)
    assert.deepStrictEqual(employee.gender, undefined)
    assert.deepStrictEqual(employee.grossPay, Util.formatCurrency(5_000.40))
    assert.deepStrictEqual(employee.netPay, Util.formatCurrency(4_000.32))

    const expectedBirthYear = 2003

    assert.deepStrictEqual(employee.birthYear, expectedBirthYear)

    // Como o .birthYear não tem set, o resultado não irá mudar
    employee.birthYear = new Date().getFullYear() - 80

    assert.deepStrictEqual(employee.birthYear,  expectedBirthYear)

    employee.age = 80

    assert.deepStrictEqual(employee.birthYear,  1941)

    console.log('\n ----- Employee -----')
    console.log('employee.name', employee.name)
    console.log('employee.age', employee.age)
    console.log('employee.gender', employee.gender)
    console.log('employee.grossPay', employee.grossPay)
    console.log('employee.netPay', employee.netPay)
}

{
    const manager = new Manager({
        name: 'Dyogo',
        age: 16,
        gender: GENDER.male
    })

    assert.deepStrictEqual(manager.name, 'Mr. Dyogo')
    assert.deepStrictEqual(manager.age, undefined)
    assert.deepStrictEqual(manager.gender, undefined)
    assert.deepStrictEqual(manager.birthYear, 2005)
    assert.deepStrictEqual(manager.grossPay, Util.formatCurrency(5_000.40))
    assert.deepStrictEqual(manager.netPay, Util.formatCurrency(6_000.32))

    console.log('\n ----- Manager -----')
    console.log('manager.name', manager.name)
    console.log('manager.age', manager.age)
    console.log('manager.gender', manager.gender)
    console.log('manager.grossPay', manager.grossPay)
    console.log('manager.netPay', manager.netPay)
}