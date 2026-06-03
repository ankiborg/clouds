import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'
import RSSParser from 'rss-parser'
import { createHash } from 'crypto'
import { logger } from './logger'

const KEYWORDS = [
  'easter egg', 'clue', 'hint', 'theory', 'spotted', 'hidden', 'secret',
  'capitalisation', 'metadata', 'streaming', 'outfit', 'announcement',
  'countdown', 'vault', 'toy story', 'clouds', ' 13 ', 'ts13',
]

function containsKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return KEYWORDS.some(k => lower.includes(k))
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function urlAlreadySeen(supabase: SupabaseClient, url: string): Promise<boolean> {
  const { data } = await supabase
    .from('raw_events')
    .select('id')
    .eq('source_url', url)
    .limit(1)
    .maybeSingle()
  return !!data
}

async function writeRawEvent(
  supabase: SupabaseClient,
  event: {
    source_type: string
    source_url?: string
    raw_content: string
    raw_metadata?: Record<string, unknown>
    spotted_at: string
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('raw_events').insert(event as any)
  if (error) logger.harvest(`Failed to write raw_event: ${error.message}`)
}

async function getAgentState(supabase: SupabaseClient, key: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('agent_state') as any).select('value').eq('key', key).maybeSingle()
  return (data as { value: string } | null)?.value ?? null
}

async function setAgentState(supabase: SupabaseClient, key: string, value: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('agent_state') as any).upsert({ key, value, updated_at: new Date().toISOString() })
}

async function harvestReddit(supabase: SupabaseClient) {
  const subreddits = ['TaylorSwift', 'SwiftlyNeutral']
  for (const sub of subreddits) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
        headers: { 'User-Agent': 'SwiftWatch/1.0 (taylor swift easter egg tracker)' },
      })
      if (!res.ok) {
        logger.harvest(`Reddit ${sub}: HTTP ${res.status}`)
        continue
      }
      const json = await res.json() as { data: { children: Array<{ data: { url: string; title: string; selftext: string; score: number; author: string; subreddit: string; created_utc: number } }> } }
      const posts = json.data.children.map(c => c.data)

      for (const post of posts) {
        const combined = `${post.title} ${post.selftext}`
        if (!containsKeyword(combined)) continue
        if (await urlAlreadySeen(supabase, post.url)) continue

        await writeRawEvent(supabase, {
          source_type: 'reddit',
          source_url: post.url,
          raw_content: `${post.title}\n\n${post.selftext}`,
          raw_metadata: { score: post.score, author: post.author, subreddit: post.subreddit },
          spotted_at: new Date(post.created_utc * 1000).toISOString(),
        })
        logger.harvest(`Reddit new event: ${post.title.slice(0, 60)}`)
      }
    } catch (err) {
      logger.harvest(`Reddit ${sub} error: ${err}`)
    }
  }
}

async function harvestTaylorSwiftCom(supabase: SupabaseClient) {
  try {
    const res = await fetch('https://www.taylorswift.com', {
      headers: { 'User-Agent': 'SwiftWatch/1.0 (taylor swift easter egg tracker)' },
    })
    if (!res.ok) { logger.harvest(`taylorswift.com: HTTP ${res.status}`); return }
    const html = await res.text()
    const $ = cheerio.load(html)
    const text = [$('title').text(), $('h1,h2,p').map((_, el) => $(el).text()).get().join(' ')].join(' ')
    const hash = createHash('sha256').update(text).digest('hex')

    const prevHash = await getAgentState(supabase, 'ts_com_hash')
    if (hash === prevHash) { logger.harvest('taylorswift.com: no change'); return }

    await setAgentState(supabase, 'ts_com_hash', hash)
    await writeRawEvent(supabase, {
      source_type: 'taylorswift_com',
      source_url: 'https://www.taylorswift.com',
      raw_content: text.slice(0, 4000),
      spotted_at: new Date().toISOString(),
    })
    logger.harvest('taylorswift.com: change detected, raw_event written')
  } catch (err) {
    logger.harvest(`taylorswift.com error: ${err}`)
  }
}

async function getSpotifyToken(): Promise<string | null> {
  try {
    const creds = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) return null
    const json = await res.json() as { access_token: string }
    return json.access_token
  } catch {
    return null
  }
}

async function harvestSpotify(supabase: SupabaseClient) {
  try {
    const token = await getSpotifyToken()
    if (!token) { logger.harvest('Spotify: could not get token'); return }

    const albumsRes = await fetch(
      'https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02/albums?limit=10&include_groups=album,single',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!albumsRes.ok) { logger.harvest(`Spotify albums: HTTP ${albumsRes.status}`); return }
    const albumsJson = await albumsRes.json() as object
    const hash = createHash('sha256').update(JSON.stringify(albumsJson)).digest('hex')

    const prevHash = await getAgentState(supabase, 'spotify_hash')
    if (hash === prevHash) { logger.harvest('Spotify: no change'); return }

    await setAgentState(supabase, 'spotify_hash', hash)
    await writeRawEvent(supabase, {
      source_type: 'spotify',
      raw_content: JSON.stringify(albumsJson).slice(0, 4000),
      spotted_at: new Date().toISOString(),
    })
    logger.harvest('Spotify: change detected, raw_event written')
  } catch (err) {
    logger.harvest(`Spotify error: ${err}`)
  }
}

async function harvestFanBlogs(supabase: SupabaseClient) {
  const feeds = [
    'https://swiftieconnection.com/feed/',
    'https://taylorswiftweb.net/feed/',
  ]
  const parser = new RSSParser()
  const cutoff = new Date(Date.now() - 60 * 60 * 1000)

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl)
      for (const item of feed.items ?? []) {
        const pubDate = item.pubDate ? new Date(item.pubDate) : null
        if (!pubDate || pubDate < cutoff) continue
        if (!item.link) continue
        if (await urlAlreadySeen(supabase, item.link)) continue

        await writeRawEvent(supabase, {
          source_type: 'fan_blog',
          source_url: item.link,
          raw_content: `${item.title ?? ''}\n\n${item.contentSnippet ?? ''}`,
          spotted_at: pubDate.toISOString(),
        })
        logger.harvest(`Fan blog new event: ${String(item.title ?? '').slice(0, 60)}`)
      }
    } catch (err) {
      logger.harvest(`Fan blog ${feedUrl} error: ${err}`)
    }
  }
}

// X harvesting deferred to v2 (paid API required)

export async function runHarvestingAgent(): Promise<void> {
  logger.harvest('Starting harvest run')
  const supabase = getServiceClient()

  await harvestReddit(supabase)
  await harvestTaylorSwiftCom(supabase)
  await harvestSpotify(supabase)
  await harvestFanBlogs(supabase)

  logger.harvest('Harvest complete — triggering classification')
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `https://${process.env.VERCEL_URL ?? 'localhost:3000'}`
      : 'http://localhost:3000'
    await fetch(`${baseUrl}/api/agents/classify`, { method: 'POST' })
  } catch (err) {
    logger.harvest(`Failed to trigger classify: ${err}`)
  }
}
