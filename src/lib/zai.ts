export async function trackZaiEvent(
  event: string,
  payload: Record<string, any> = {}
) {
  try {
    // لو عندك endpoint خارجي للأناليتيكس
    const endpoint = process.env.ZAI_EVENTS_ENDPOINT
    const apiKey = process.env.ZAI_API_KEY

    if (!endpoint || !apiKey) return

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ event, ...payload }),
    })
  } catch (err) {
    console.error('trackZaiEvent error', err)
  }
}