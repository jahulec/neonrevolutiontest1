import { absoluteUrl } from './html.mjs';

function entityRef(site) {
  const id = absoluteUrl(site.siteUrl, '/#band');
  return id ? { '@id': id } : { '@type': 'MusicGroup', name: site.brand };
}

function imageUrl(site, path) {
  return path ? absoluteUrl(site.siteUrl, path) : null;
}

function warsawOffset(date) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Warsaw',
    timeZoneName: 'longOffset'
  }).formatToParts(new Date(`${date}T12:00:00Z`));
  const value = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+01:00';
  const match = value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return '+01:00';
  return `${match[1]}${match[2].padStart(2, '0')}:${match[3] ?? '00'}`;
}

function youtubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v');
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function bandEntity({ site, press }) {
  const id = absoluteUrl(site.siteUrl, '/#band');
  const url = absoluteUrl(site.siteUrl, '/');
  const logo = imageUrl(site, '/assets/sygnet-neon.webp');
  const image = imageUrl(site, '/assets/hero-band.webp');
  const profiles = [...Object.values(site.profiles), ...(site.entity?.additionalProfiles ?? [])];
  return {
    '@type': 'MusicGroup',
    ...(id ? { '@id': id } : {}),
    name: site.brand,
    alternateName: site.entity?.alternateNames,
    description: press.bio.pl,
    genre: site.entity?.genres ?? ['rock', 'synth-pop', 'alternative rock'],
    ...(url ? { url } : {}),
    ...(logo ? { logo } : {}),
    ...(image ? { image } : {}),
    email: site.contact.email,
    telephone: site.contact.phone,
    sameAs: profiles,
    award: press.achievements.map((item) => `${item.year} — ${item.title.pl}`),
    ...(site.entity?.origin ? {
      foundingLocation: {
        '@type': 'Place',
        name: `${site.entity.origin.city}, Polska`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: site.entity.origin.city,
          addressRegion: site.entity.origin.region,
          addressCountry: site.entity.origin.countryCode
        }
      }
    } : {}),
    ...(press.coverage?.length ? {
      subjectOf: press.coverage.map((item) => ({
        '@type': 'Article',
        headline: item.title.pl,
        datePublished: item.date,
        url: item.url,
        publisher: { '@type': 'Organization', name: item.publisher }
      }))
    } : {}),
    member: press.members.map((member) => ({
      '@type': 'Person',
      name: member.name,
      roleName: member.role.pl
    }))
  };
}

function webPageEntity({ site, page, path, lang, routeId }) {
  const url = absoluteUrl(site.siteUrl, path);
  const websiteId = absoluteUrl(site.siteUrl, '/#website');
  const types = {
    gallery: 'ImageGallery',
    contact: 'ContactPage',
    press: 'AboutPage'
  };
  return {
    '@type': types[routeId] ?? 'WebPage',
    ...(url ? { '@id': `${url}#webpage`, url } : {}),
    name: page.title,
    description: page.description,
    inLanguage: lang,
    ...(websiteId ? { isPartOf: { '@id': websiteId } } : {})
  };
}

function breadcrumbEntity({ site, locale, path, routeId }) {
  if (routeId === 'home') return null;
  const home = absoluteUrl(site.siteUrl, '/');
  const current = absoluteUrl(site.siteUrl, path);
  if (!home || !current) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.brand, item: home },
      { '@type': 'ListItem', position: 2, name: locale.pages[routeId]?.heading ?? locale.pages[routeId]?.title, item: current }
    ]
  };
}

function musicEntities({ site, releases }) {
  return releases.map((release) => ({
    '@type': 'MusicRecording',
    name: release.title,
    byArtist: entityRef(site),
    ...(release.date ? { datePublished: release.date } : release.year ? { datePublished: release.year } : {}),
    ...(imageUrl(site, release.cover) ? { image: imageUrl(site, release.cover) } : {}),
    sameAs: [release.links.spotify, release.links.youtube, release.links.appleMusic, release.links.smartlink].filter(Boolean)
  }));
}

function eventEntities({ site, shows, lang, path }) {
  const today = new Date().toISOString().slice(0, 10);
  const pageUrl = absoluteUrl(site.siteUrl, path);
  const eventImage = imageUrl(site, '/assets/neon-revolution-live.webp');
  return shows
    .filter((show) => show.status === 'real' && show.date >= today)
    .map((show) => {
      const copy = show[lang];
      const startDate = show.start ? `${show.date}T${show.start}:00${warsawOffset(show.date)}` : show.date;
      return {
        '@type': 'MusicEvent',
        name: `${site.brand} — ${copy.city}`,
        startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: copy.venue,
          address: {
            '@type': 'PostalAddress',
            streetAddress: copy.venue,
            addressLocality: copy.city,
            addressCountry: 'PL'
          }
        },
        performer: entityRef(site),
        ...(eventImage ? { image: [eventImage] } : {}),
        ...(pageUrl ? { url: `${pageUrl}#${show.id}` } : {})
      };
    });
}

function galleryEntities({ site, gallery, lang }) {
  return gallery.filter((item) => item.status === 'real' && item.image).map((item) => ({
    '@type': 'ImageObject',
    contentUrl: imageUrl(site, item.image),
    caption: item.alt?.[lang] ?? site.brand,
    representativeOfPage: false
  }));
}

function videoList({ site, videos }) {
  return {
    '@type': 'ItemList',
    itemListElement: videos.map((video, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        name: video.title,
        description: `${video.title} — ${site.brand}`,
        uploadDate: video.date,
        thumbnailUrl: imageUrl(site, video.thumbnail),
        ...(youtubeEmbedUrl(video.youtube) ? { embedUrl: youtubeEmbedUrl(video.youtube) } : {}),
        url: video.youtube
      }
    }))
  };
}

export function structuredDataForPage({ site, press, shows, releases, videos, gallery, locale, lang, routeId, path, page, newsEntry = null }) {
  const graph = [webPageEntity({ site, page, path, lang, routeId })];
  if (routeId === 'home') {
    const websiteId = absoluteUrl(site.siteUrl, '/#website');
    graph.push(bandEntity({ site, press }), {
      '@type': 'WebSite',
      ...(websiteId ? { '@id': websiteId } : {}),
      name: site.brand,
      alternateName: site.entity?.alternateNames,
      url: absoluteUrl(site.siteUrl, '/'),
      inLanguage: ['pl', 'en'],
      publisher: entityRef(site)
    });
  }
  if (routeId === 'music') graph.push({ '@type': 'ItemList', itemListElement: musicEntities({ site, releases }) });
  if (routeId === 'live') graph.push(...eventEntities({ site, shows, lang, path }));
  if (routeId === 'gallery') graph.push(...galleryEntities({ site, gallery, lang }));
  if (routeId === 'video') graph.push(videoList({ site, videos }));
  if (routeId === 'press') graph.push(bandEntity({ site, press }));
  const breadcrumb = breadcrumbEntity({ site, locale, path, routeId });
  if (breadcrumb) graph.push(breadcrumb);

  if (newsEntry?.status === 'real') {
    const copy = newsEntry[lang];
    const articleUrl = absoluteUrl(site.siteUrl, path);
    const articleImage = imageUrl(site, newsEntry.image);
    graph.push({
      '@type': 'NewsArticle',
      headline: copy.title,
      description: copy.summary,
      datePublished: newsEntry.date,
      dateModified: newsEntry.date,
      inLanguage: lang,
      author: entityRef(site),
      publisher: entityRef(site),
      ...(articleUrl ? { mainEntityOfPage: articleUrl } : {}),
      ...(articleImage ? { image: [articleImage] } : {})
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph.filter(Boolean) };
}
