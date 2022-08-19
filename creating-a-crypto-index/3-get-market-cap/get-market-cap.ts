import 'dotenv/config'
import 'isomorphic-fetch'
;(async () => {
  try {
    const response = await fetch(
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
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
})()
