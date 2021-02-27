const Employee = require("./employee");
const Util = require("./util");

class Manager extends Employee{
    #bonuses = 2_000

    get bonuses () {
        return Util.formatCurrency(this.#bonuses)
    }

    get netPay(){
        const finalValue = Util.unformatCurrency(super.netPay) + this.#bonuses 

        return Util.formatCurrency(finalValue)
    }
}

module.exports = Manager