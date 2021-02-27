const Request = require("./request")

const request = new Request()

async function scheduler(){
    const requests = [
        { url: 'https://www.mercadobitcoin.net/api/BTC/ticker/' },
        { url: 'https://www.NAO_EXISTE.net/api/BTC/ticker/' },
        { url: 'https://www.mercadobitcoin.net/api/BTC/orderbook/' }
    ]
    .map(data => ({
        ...data,
        timeout: 2000,
        method: 'get'
    }))
    .map(params => request.makeRequest(params))

    const result = await Promise.allSettled(requests)

    const [ allFailed, allSucceded ] = [
        result.filter(({ status }) => status === 'rejected').map(({ reason }) => reason),
        result.filter(({ status }) => status === 'fulfilled').map(({ value }) => value)
    ]

    console.log({
        allFailed,
        allSucceded: JSON.stringify(allSucceded)
    })
}

const PERIOD = 2000

setInterval(scheduler, PERIOD)