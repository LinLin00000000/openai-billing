import fetch from 'cross-fetch'

/**
 * @param {string} apikey
 * @param {object} options
 * @param {string} options.baseURL - openai api base url, need http/https prefix, default to 'https://api.openai.com'
 * @returns {Promise<{ total: number, used: number, remain: number, expiresTime: number } | { error: { code: string, message: string } }>}
 */
export async function fetchBilling(
    apikey,
    { baseURL = 'https://api.openai.com' } = {}
) {
    const headers = {
        'Authorization': 'Bearer ' + apikey,
        'Content-Type': 'application/json',
    }

    try {
        const subscription = await fetch(`${baseURL}/dashboard/billing/subscription`, { headers }).then(res => res.json())

        if (subscription.error) {
            return {
                error: {
                    code: subscription.error.code,
                    message: subscription.error.message,
                },
            }
        }

        const now = new Date()
        const expiresTime = subscription.access_until * 1000

        if (now > expiresTime) {
            return {
                error: {
                    code: 'grant_expired',
                    message: 'The grant for the account has expired',
                },
            }
        }

        // 如果用户绑卡，额度每月会刷新，则起始日期为本月第一天，否则为三个月前
        const startDate = subscription.has_payment_method
            ? new Date(now.getFullYear(), now.getMonth())
            : new Date(now - 90 * 24 * 60 * 60 * 1000)

        const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const usage = await fetch(`${baseURL}/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`, { headers }).then(res => res.json())

        const total = subscription.hard_limit_usd
        const used = usage.total_usage / 100
        const remain = total - used

        return {
            total,
            used,
            remain,
            expiresTime
        }
    } catch (err) {
        return {
            error: {
                code: err.code ?? 'unknown',
                message: err.message ?? err.stack,
            },
        }
    }
}

/**
 * @param {Date} date
 */
function formatDate(date) {
    return date.toISOString().slice(0, 10)
}
