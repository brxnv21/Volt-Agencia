// Push notification via ntfy.sh — chega no celular com som, mesmo com app fechado.
// Configure NTFY_TOPIC nas variáveis de ambiente da Vercel (mesmo tópico assinado no app ntfy do celular).

const NTFY_SERVER = 'https://ntfy.sh'

export async function sendPush(title: string, message: string, tags: string[] = [], priority: 3 | 4 | 5 = 5): Promise<boolean> {
  const topic = process.env.NTFY_TOPIC
  if (!topic) {
    console.log('[PUSH] NTFY_TOPIC nao configurado — push ignorado')
    return false
  }
  try {
    const res = await fetch(`${NTFY_SERVER}/${topic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': String(priority),
        'Tags': tags.join(','),
      },
      body: message,
    })
    if (!res.ok) {
      console.error(`[PUSH ERROR] ${res.status} ${await res.text()}`)
      return false
    }
    console.log(`[PUSH] Enviado para ${topic}: ${title}`)
    return true
  } catch (e) {
    console.error('[PUSH EXCEPTION]', e)
    return false
  }
}
