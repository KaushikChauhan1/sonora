import { Track, Album, Playlist, Lyric } from '../../types';
import kaushikData from './kaushik_channel_data.json';

export const KAUSHIK_CHANNEL_INFO = {
  handle: kaushikData.channelHandle,
  url: kaushikData.channelUrl,
  id: kaushikData.channelId,
  syncedAt: kaushikData.syncedAt
};

export const KAUSHIK_PLAYLISTS: Playlist[] = kaushikData.playlists.map(p => ({
  ...p,
  tracks: p.tracks as Track[]
}));

export const FEATURED_TRACKS: Track[] = [
  {
    id: 'track-1',
    videoId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'artist-the-weeknd',
    album: 'After Hours',
    albumId: 'album-after-hours',
    durationSeconds: 200,
    artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
    year: 2020,
    genre: 'Synthwave',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-2',
    videoId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    artistId: 'artist-harry-styles',
    album: "Harry's House",
    albumId: 'album-harrys-house',
    durationSeconds: 167,
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    year: 2022,
    genre: 'Indie Pop',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-3',
    videoId: 'dX3k_QDnzHE',
    title: 'Midnight City',
    artist: 'M83',
    artistId: 'artist-m83',
    album: 'Hurry Up, We\'re Dreaming',
    albumId: 'album-hurry-up',
    durationSeconds: 243,
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    year: 2011,
    genre: 'Dream Pop',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-4',
    videoId: '5NV6Rdv1a3I',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    artistId: 'artist-daft-punk',
    album: 'Random Access Memories',
    albumId: 'album-ram',
    durationSeconds: 248,
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    year: 2013,
    genre: 'Disco / Funk',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-5',
    videoId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    artistId: 'artist-dua-lipa',
    album: 'Future Nostalgia',
    albumId: 'album-future-nostalgia',
    durationSeconds: 203,
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    year: 2020,
    genre: 'Nu-Disco',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-6',
    videoId: 'ApXoWvfEYVU',
    title: 'Sunflower',
    artist: 'Post Malone & Swae Lee',
    artistId: 'artist-post-malone',
    album: 'Spider-Man: Into the Spider-Verse',
    albumId: 'album-spider-verse',
    durationSeconds: 158,
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    year: 2018,
    genre: 'Melodic Hip-Hop',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-7',
    videoId: 'em0MknB6wFo',
    title: 'Something About Us',
    artist: 'Daft Punk',
    artistId: 'artist-daft-punk',
    album: 'Discovery',
    albumId: 'album-discovery',
    durationSeconds: 231,
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    year: 2001,
    genre: 'French Touch',
    explicit: false,
    provider: 'youtube-music'
  },
  {
    id: 'track-8',
    videoId: '8GW6sLrK40k',
    title: 'Resonance',
    artist: 'HOME',
    artistId: 'artist-home',
    album: 'Odyssey',
    albumId: 'album-odyssey',
    durationSeconds: 212,
    artworkUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    year: 2014,
    genre: 'Chillwave',
    explicit: false,
    provider: 'youtube-music'
  }
];

export const FEATURED_ALBUMS: Album[] = [
  {
    id: 'album-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    artistId: 'artist-the-weeknd',
    artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
    year: 2020,
    trackCount: 14,
    tracks: [FEATURED_TRACKS[0]]
  },
  {
    id: 'album-ram',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    artistId: 'artist-daft-punk',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    year: 2013,
    trackCount: 13,
    tracks: [FEATURED_TRACKS[3]]
  },
  {
    id: 'album-harrys-house',
    title: "Harry's House",
    artist: 'Harry Styles',
    artistId: 'artist-harry-styles',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    year: 2022,
    trackCount: 13,
    tracks: [FEATURED_TRACKS[1]]
  },
  {
    id: 'album-future-nostalgia',
    title: 'Future Nostalgia',
    artist: 'Dua Lipa',
    artistId: 'artist-dua-lipa',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    year: 2020,
    trackCount: 11,
    tracks: [FEATURED_TRACKS[4]]
  }
];

export const EDITORIAL_PLAYLISTS: Playlist[] = [
  ...KAUSHIK_PLAYLISTS,
  {
    id: 'playlist-morning-focus',
    title: 'Morning Light & Focus',
    description: 'Clean acoustic grooves and warm ambient frequencies to start your day.',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trackCount: 6,
    tracks: [FEATURED_TRACKS[1], FEATURED_TRACKS[7], FEATURED_TRACKS[6]],
    isCustom: false,
    createdAt: '2026-01-01'
  },
  {
    id: 'playlist-night-drive',
    title: 'Midnight Highway',
    description: 'Cinematic synthwave, retro French touch, and late-night pulse.',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    trackCount: 8,
    tracks: [FEATURED_TRACKS[0], FEATURED_TRACKS[2], FEATURED_TRACKS[3]],
    isCustom: false,
    createdAt: '2026-01-02'
  },
  {
    id: 'playlist-pure-funk',
    title: 'Modern Disco & Nu-Funk',
    description: 'Crisp basslines, four-on-the-floor rhythms, and shimmering guitars.',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    trackCount: 5,
    tracks: [FEATURED_TRACKS[3], FEATURED_TRACKS[4], FEATURED_TRACKS[5]],
    isCustom: false,
    createdAt: '2026-01-03'
  }
];

export const SEED_WORD_SYNC_LYRICS: Record<string, Lyric[]> = {
  // Blinding Lights - The Weeknd (Word-by-word Enhanced LRC representation)
  'track-1': [
    {
      startTimeMs: 14000,
      durationMs: 3800,
      words: "Yeah, yeah",
      parts: [
        { startTimeMs: 14000, durationMs: 1500, words: "Yeah," },
        { startTimeMs: 15700, durationMs: 2100, words: "yeah" }
      ]
    },
    {
      startTimeMs: 26000,
      durationMs: 5200,
      words: "I've been tryna call",
      parts: [
        { startTimeMs: 26000, durationMs: 1200, words: "I've" },
        { startTimeMs: 27200, durationMs: 1000, words: "been" },
        { startTimeMs: 28200, durationMs: 1200, words: "tryna" },
        { startTimeMs: 29400, durationMs: 1800, words: "call" }
      ]
    },
    {
      startTimeMs: 31500,
      durationMs: 5000,
      words: "I've been on my own for long enough",
      parts: [
        { startTimeMs: 31500, durationMs: 800, words: "I've" },
        { startTimeMs: 32300, durationMs: 700, words: "been" },
        { startTimeMs: 33000, durationMs: 600, words: "on" },
        { startTimeMs: 33600, durationMs: 700, words: "my" },
        { startTimeMs: 34300, durationMs: 900, words: "own" },
        { startTimeMs: 35200, durationMs: 600, words: "for" },
        { startTimeMs: 35800, durationMs: 700, words: "long" },
        { startTimeMs: 36500, durationMs: 1000, words: "enough" }
      ]
    },
    {
      startTimeMs: 37000,
      durationMs: 5200,
      words: "Maybe you can show me how to love, maybe",
      parts: [
        { startTimeMs: 37000, durationMs: 800, words: "Maybe" },
        { startTimeMs: 37800, durationMs: 600, words: "you" },
        { startTimeMs: 38400, durationMs: 700, words: "can" },
        { startTimeMs: 39100, durationMs: 700, words: "show" },
        { startTimeMs: 39800, durationMs: 500, words: "me" },
        { startTimeMs: 40300, durationMs: 600, words: "how" },
        { startTimeMs: 40900, durationMs: 500, words: "to" },
        { startTimeMs: 41400, durationMs: 800, words: "love," },
        { startTimeMs: 42200, durationMs: 1000, words: "maybe" }
      ]
    },
    {
      startTimeMs: 43000,
      durationMs: 5000,
      words: "I'm going through withdrawals",
      parts: [
        { startTimeMs: 43000, durationMs: 900, words: "I'm" },
        { startTimeMs: 43900, durationMs: 900, words: "going" },
        { startTimeMs: 44800, durationMs: 1200, words: "through" },
        { startTimeMs: 46000, durationMs: 2000, words: "withdrawals" }
      ]
    },
    {
      startTimeMs: 48500,
      durationMs: 5500,
      words: "You don't even have to do too much",
      parts: [
        { startTimeMs: 48500, durationMs: 800, words: "You" },
        { startTimeMs: 49300, durationMs: 800, words: "don't" },
        { startTimeMs: 50100, durationMs: 800, words: "even" },
        { startTimeMs: 50900, durationMs: 700, words: "have" },
        { startTimeMs: 51600, durationMs: 600, words: "to" },
        { startTimeMs: 52200, durationMs: 700, words: "do" },
        { startTimeMs: 52900, durationMs: 700, words: "too" },
        { startTimeMs: 53600, durationMs: 1400, words: "much" }
      ]
    },
    {
      startTimeMs: 54500,
      durationMs: 5000,
      words: "You can turn me on with just a touch, baby",
      parts: [
        { startTimeMs: 54500, durationMs: 700, words: "You" },
        { startTimeMs: 55200, durationMs: 600, words: "can" },
        { startTimeMs: 55800, durationMs: 700, words: "turn" },
        { startTimeMs: 56500, durationMs: 600, words: "me" },
        { startTimeMs: 57100, durationMs: 700, words: "on" },
        { startTimeMs: 57800, durationMs: 600, words: "with" },
        { startTimeMs: 58400, durationMs: 600, words: "just" },
        { startTimeMs: 59000, durationMs: 500, words: "a" },
        { startTimeMs: 59500, durationMs: 800, words: "touch," },
        { startTimeMs: 60300, durationMs: 1200, words: "baby" }
      ]
    },
    {
      startTimeMs: 62000,
      durationMs: 5500,
      words: "I look around and Sin City's cold and empty",
      parts: [
        { startTimeMs: 62000, durationMs: 600, words: "I" },
        { startTimeMs: 62600, durationMs: 600, words: "look" },
        { startTimeMs: 63200, durationMs: 800, words: "around" },
        { startTimeMs: 64000, durationMs: 600, words: "and" },
        { startTimeMs: 64600, durationMs: 700, words: "Sin" },
        { startTimeMs: 65300, durationMs: 800, words: "City's" },
        { startTimeMs: 66100, durationMs: 700, words: "cold" },
        { startTimeMs: 66800, durationMs: 600, words: "and" },
        { startTimeMs: 67400, durationMs: 1100, words: "empty" }
      ]
    },
    {
      startTimeMs: 68000,
      durationMs: 4500,
      words: "No one's around to judge me",
      parts: [
        { startTimeMs: 68000, durationMs: 800, words: "No" },
        { startTimeMs: 68800, durationMs: 800, words: "one's" },
        { startTimeMs: 69600, durationMs: 800, words: "around" },
        { startTimeMs: 70400, durationMs: 600, words: "to" },
        { startTimeMs: 71000, durationMs: 800, words: "judge" },
        { startTimeMs: 71800, durationMs: 1000, words: "me" }
      ]
    },
    {
      startTimeMs: 73000,
      durationMs: 5500,
      words: "I can't see clearly when you're gone",
      parts: [
        { startTimeMs: 73000, durationMs: 700, words: "I" },
        { startTimeMs: 73700, durationMs: 700, words: "can't" },
        { startTimeMs: 74400, durationMs: 700, words: "see" },
        { startTimeMs: 75100, durationMs: 800, words: "clearly" },
        { startTimeMs: 75900, durationMs: 700, words: "when" },
        { startTimeMs: 76600, durationMs: 700, words: "you're" },
        { startTimeMs: 77300, durationMs: 1200, words: "gone" }
      ]
    },
    {
      startTimeMs: 79500,
      durationMs: 5500,
      words: "I said, ooh, I'm blinded by the lights",
      parts: [
        { startTimeMs: 79500, durationMs: 600, words: "I" },
        { startTimeMs: 80100, durationMs: 700, words: "said," },
        { startTimeMs: 80800, durationMs: 900, words: "ooh," },
        { startTimeMs: 81700, durationMs: 700, words: "I'm" },
        { startTimeMs: 82400, durationMs: 900, words: "blinded" },
        { startTimeMs: 83300, durationMs: 600, words: "by" },
        { startTimeMs: 83900, durationMs: 600, words: "the" },
        { startTimeMs: 84500, durationMs: 1500, words: "lights" }
      ]
    },
    {
      startTimeMs: 85500,
      durationMs: 6000,
      words: "No, I can't sleep until I feel your touch",
      parts: [
        { startTimeMs: 85500, durationMs: 600, words: "No," },
        { startTimeMs: 86100, durationMs: 600, words: "I" },
        { startTimeMs: 86700, durationMs: 700, words: "can't" },
        { startTimeMs: 87400, durationMs: 800, words: "sleep" },
        { startTimeMs: 88200, durationMs: 700, words: "until" },
        { startTimeMs: 88900, durationMs: 600, words: "I" },
        { startTimeMs: 89500, durationMs: 700, words: "feel" },
        { startTimeMs: 90200, durationMs: 700, words: "your" },
        { startTimeMs: 90900, durationMs: 1600, words: "touch" }
      ]
    }
  ],

  // As It Was - Harry Styles
  'track-2': [
    {
      startTimeMs: 8000,
      durationMs: 4000,
      words: "Hold on, as it was",
      parts: [
        { startTimeMs: 8000, durationMs: 1500, words: "Hold" },
        { startTimeMs: 9500, durationMs: 1000, words: "on," },
        { startTimeMs: 10500, durationMs: 700, words: "as" },
        { startTimeMs: 11200, durationMs: 700, words: "it" },
        { startTimeMs: 11900, durationMs: 1100, words: "was" }
      ]
    },
    {
      startTimeMs: 12500,
      durationMs: 5000,
      words: "You know it's not the same as it was",
      parts: [
        { startTimeMs: 12500, durationMs: 700, words: "You" },
        { startTimeMs: 13200, durationMs: 700, words: "know" },
        { startTimeMs: 13900, durationMs: 700, words: "it's" },
        { startTimeMs: 14600, durationMs: 700, words: "not" },
        { startTimeMs: 15300, durationMs: 600, words: "the" },
        { startTimeMs: 15900, durationMs: 900, words: "same" },
        { startTimeMs: 16800, durationMs: 600, words: "as" },
        { startTimeMs: 17400, durationMs: 600, words: "it" },
        { startTimeMs: 18000, durationMs: 1000, words: "was" }
      ]
    }
  ]
};
