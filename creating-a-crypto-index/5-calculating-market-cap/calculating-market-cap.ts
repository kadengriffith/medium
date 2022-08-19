import { CoinbasePro, type ProductTicker } from 'coinbase-pro-node'
import 'dotenv/config'
import 'isomorphic-fetch'

interface ExtendedProductTicker extends ProductTicker {
  market_cap?: number
  cmc?: {
    id: SVGAnimatedNumber
    name: string
    symbol: string
    slug: string
    num_market_pairs: number
    date_added: string
    tags: string[]
    max_supply: number | null
    circulating_supply: number
    total_supply: number
    platform: Record<string, unknown>
    cmc_rank: number
    self_reported_circulating_supply: null
    self_reported_market_cap: null
    tvl_ratio: null
    last_updated: string
    quote: Record<string, unknown>
  }
}

const client = new CoinbasePro()

;(async () => {
  try {
    const products = (await client.rest.product.getProducts()).filter((product) =>
      product.id.endsWith('USD')
    )

    const tickers: Record<string, ExtendedProductTicker> = {}
    for (const product of products) {
      try {
        const ticker = await client.rest.product.getProductTicker(product.id)

        tickers[product.id] = ticker
      } catch (error) {
        console.error(`Excluded product: ${product.id}`)
      }
    }

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

    for (const [key] of Object.entries(tickers).filter(
      ([_key, { cmc }]) => typeof cmc === 'undefined'
    )) {
      delete tickers[key]
    }

    for (const ticker of Object.values(tickers)) {
      ticker.market_cap = parseFloat(ticker.price) * ticker.cmc.circulating_supply
    }

    const totalMarketCap = Object.values(tickers).reduce((total, { market_cap }) => {
      return total + market_cap
    }, 0)

    console.log(`Total market cap: ${totalMarketCap} USD`)
    console.log(
      `Bitcoin dominance: ${(
        (tickers['BTC-USD'].market_cap / totalMarketCap) *
        100
      ).toFixed(2)}%`
    )
  } catch (error) {
    console.error(error)
  }
})()
