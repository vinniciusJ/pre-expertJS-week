const Request = require("./request")

const DEFAULT_OPTIONS = {
    maxRetries: 4,
    retryTimeout: 1000,
    maxRequestTimeout: 1000,
    threshold: 200
}

class Pagination{
    constructor(options = DEFAULT_OPTIONS){
        this.request = new Request()

        this.maxRetries = options.maxRetries,
        this.retryTimeout = options.retryTimeout,
        this.maxRequestTimeout = options.maxRequestTimeout,
        this.threshold = options.threshold
    }

    static async sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async handleRequest({ url, page, retries = 1 }){
        try {
            const finalURL = `${url}?tid=${page}`

            const result = await this.request.makeRequest({
                url: finalURL,
                method: 'get',
                timeout: this.maxRequestTimeout
            })

            return result
        } 
        catch (error) {
            if(retries === this.maxRetries) {
                console.error(`[${retries}] max retries reached`)
                throw error
            }

            console.error(`
            [${retries}] an error: [${error.message}] has happende. Trying again in ${this.retryTimeout}ms
            `)

            await Pagination.sleep(this.retryTimeout)

            return this.handleRequest({ url, page, retries: retries += 1 })
        }
    }

    async * getPaginated({ url, page }){
        const result = await this.handleRequest({ url, page })
        const lastID = result[result.length - 1]?.tid ?? 0

        if(lastID === 0) return

        yield result

        await Pagination.sleep(this.threshold)

        yield * this.getPaginated({ url, page: lastID })
    }

}

module.exports = Pagination