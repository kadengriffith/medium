import { CoinbasePro } from 'coinbase-pro-node'
import 'dotenv/config'
import 'isomorphic-fetch'

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

    const cmcResponse = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?${new URLSearchParams(
        {
          limit: '5000',
        }
      )}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY,
        },
      }
    )
    const listings = await cmcResponse.json()

    if (listings && listings.data) {
      for (const listing of listings.data) {
        const tickerKey = `${listing.symbol.toUpperCase()}-USD`

        if (tickerKey in tickers) {
          tickers[tickerKey].cmc = listing
        }
      }
    }

    console.log(
      `Number of tickers with CoinMarketCap listings: ${
        Object.values(tickers).filter(({ cmc }) => typeof cmc !== 'undefined').length
      }`
    )
  } catch (error) {
    console.error(error)
  }
})()
