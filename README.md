# 查询 openai 余额

## Usage

```javascript
import fetchBilling from "openai-billing"

const apikey = 'YOUR OPENAI KEY'

const result = await fetchBilling(apikey, { baseURL: 'https://api.openai.com' })

if (result.error) {
    const { code, message } = result.error
    console.error(`Error: ${code} - ${message}`)
}
else {
    const { total, used, remain, expiresTime } = result
    console.log(`
额度总量: 💵 $ ${total}
已用额度: 💵 $ ${used}
剩余额度: 💵 $ ${remain}
过期时间：🪫  ${new Date(expiresTime).toLocaleDateString()}
    `)
}

```
