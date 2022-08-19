import { CoinbasePro } from 'coinbase-pro-node'

const client = new CoinbasePro()

;(async () => {
  try {
    const products = (await client.rest.product.getProducts()).filter((product) =>
      product.id.endsWith('USD')
    )

    console.log(`Number of USD pairs on Coinbase Pro: ${products.length}`)
  } catch (error) {
    console.error(error)
  }
})()
