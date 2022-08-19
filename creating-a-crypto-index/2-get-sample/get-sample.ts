import { CoinbasePro } from 'coinbase-pro-node'

const client = new CoinbasePro()

;(async () => {
  try {
    const products = (await client.rest.product.getProducts()).filter((product) =>
      product.id.endsWith('USD')
    )

    const tickers = {}
    for (const product of products) {
      try {
        const ticker = await client.rest.product.getProductTicker(product.id)

        tickers[product.id] = ticker
      } catch (error) {
        console.error(`Excluded product: ${product.id}`)
      }
    }

    console.log(`Number of USD pairs in sample: ${Object.keys(tickers).length}`)
  } catch (error) {
    console.error(error)
  }
})()
