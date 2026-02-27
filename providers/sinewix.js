/**
 * Sinewix Provider for Nuvio TV
 * Sinewix (sinewix.com) içeriklerini Nuvio TV'de göstermek için provider
 *
 * Kurulum:
 * 1. Bu dosyayı kendi sunucunuza yükleyin (veya local server'da test edin)
 * 2. Nuvio > Settings > Plugins > Add Provider URL kısmına ekleyin
 */

const BASE_URL = "https://www.sinewix.com";

// Sinewix'in API ya da web endpoint'lerinden stream URL'si çekme
function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Sinewix] Fetching:", mediaType, tmdbId, season, episode);

  // Sinewix içerik URL'sini oluştur
  // Film için: /film/{slug} | Dizi için: /dizi/{slug}/{sezon}/{bolum}
  var sinewixSearchUrl =
    BASE_URL +
    "/api/search?query=" +
    tmdbId +
    "&type=" +
    (mediaType === "movie" ? "film" : "dizi");

  return fetch(sinewixSearchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
      Referer: BASE_URL,
      Accept: "application/json",
    },
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.results || data.results.length === 0) {
        console.log("[Sinewix] No results found for TMDB ID:", tmdbId);
        // TMDB ID bulunamazsa TMDB'den başlık çekip tekrar dene
        return fetchByTmdbTitle(tmdbId, mediaType, season, episode);
      }

      var content = data.results[0];
      return fetchStreamFromContent(content, mediaType, season, episode);
    })
    .catch(function (err) {
      console.error("[Sinewix] Search error:", err.message);
      // Fallback: TMDB'den başlık al ve Sinewix'te ara
      return fetchByTmdbTitle(tmdbId, mediaType, season, episode);
    });
}

function fetchByTmdbTitle(tmdbId, mediaType, season, episode) {
  var tmdbUrl =
    "https://api.themoviedb.org/3/" +
    (mediaType === "movie" ? "movie" : "tv") +
    "/" +
    tmdbId +
    "?language=tr-TR&api_key=4ef0d7355d9ffb5151e987764708ce96";

  return fetch(tmdbUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (tmdbData) {
      var title = tmdbData.title || tmdbData.name || "";
      if (!title) return [];

      console.log("[Sinewix] Searching by title:", title);

      var searchUrl =
        BASE_URL +
        "/arama?q=" +
        encodeURIComponent(title) +
        "&tip=" +
        (mediaType === "movie" ? "film" : "dizi");

      return fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
          Referer: BASE_URL,
        },
      })
        .then(function (res) {
          return res.text();
        })
        .then(function (html) {
          return parseSearchResults(html, mediaType, season, episode, title);
        });
    })
    .catch(function (err) {
      console.error("[Sinewix] TMDB fetch error:", err.message);
      return [];
    });
}

function parseSearchResults(html, mediaType, season, episode, title) {
  var cheerio = require("cheerio-without-node-native");
  var $ = cheerio.load(html);
  var contentUrl = null;

  // Sinewix arama sonuçlarından ilk sonucu al
  $(".film-item a, .content-card a, .movie-item a").each(function (i, el) {
    if (i === 0) {
      contentUrl = $(el).attr("href");
    }
  });

  if (!contentUrl) {
    // Genel link arama
    $("a[href]").each(function (i, el) {
      var href = $(el).attr("href") || "";
      var text = $(el).text().toLowerCase();
      if (
        !contentUrl &&
        (href.includes("/film/") || href.includes("/dizi/")) &&
        text.includes(title.toLowerCase().substring(0, 5))
      ) {
        contentUrl = href;
      }
    });
  }

  if (!contentUrl) {
    console.log("[Sinewix] Content URL not found for:", title);
    return [];
  }

  // Tam URL oluştur
  if (!contentUrl.startsWith("http")) {
    contentUrl = BASE_URL + contentUrl;
  }

  // Dizi ise bölüm sayfasına git
  if (mediaType === "tv" && season && episode) {
    // Sinewix dizi URL formatı: /dizi/{slug}/{sezon}/{bolum}
    var baseContentUrl = contentUrl.replace(/\/$/, "");
    contentUrl = baseContentUrl + "/" + season + "/" + episode;
  }

  return fetchVideoPage(contentUrl);
}

function fetchStreamFromContent(content, mediaType, season, episode) {
  var contentUrl = content.url || content.link || content.href || "";
  if (!contentUrl) return [];

  if (!contentUrl.startsWith("http")) {
    contentUrl = BASE_URL + contentUrl;
  }

  if (mediaType === "tv" && season && episode) {
    contentUrl = contentUrl.replace(/\/$/, "") + "/" + season + "/" + episode;
  }

  return fetchVideoPage(contentUrl);
}

function fetchVideoPage(pageUrl) {
  console.log("[Sinewix] Fetching video page:", pageUrl);

  return fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
      Referer: BASE_URL,
      Accept: "text/html,application/xhtml+xml",
    },
  })
    .then(function (res) {
      return res.text();
    })
    .then(function (html) {
      return extractStreamsFromPage(html, pageUrl);
    })
    .catch(function (err) {
      console.error("[Sinewix] Video page fetch error:", err.message);
      return [];
    });
}

function extractStreamsFromPage(html, pageUrl) {
  var cheerio = require("cheerio-without-node-native");
  var $ = cheerio.load(html);
  var streams = [];

  // iframe embed URL'lerini topla
  $("iframe").each(function (i, el) {
    var src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src && (src.includes("m3u8") || src.includes("embed") || src.includes("player"))) {
      streams.push({
        name: "Sinewix",
        title: "HD · Sinewix Player " + (i + 1),
        url: src.startsWith("http") ? src : BASE_URL + src,
        quality: "HD",
        headers: {
          Referer: pageUrl,
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
        },
      });
    }
  });

  // Doğrudan .m3u8 veya .mp4 linkleri ara
  var patterns = [
    /file:\s*["']([^"']+\.m3u8[^"']*)/gi,
    /file:\s*["']([^"']+\.mp4[^"']*)/gi,
    /source\s+src=["']([^"']+\.m3u8[^"']*)/gi,
    /source\s+src=["']([^"']+\.mp4[^"']*)/gi,
    /"url":\s*"([^"]+\.m3u8[^"]*)"/gi,
    /"file":\s*"([^"]+\.m3u8[^"]*)"/gi,
    /hlsUrl\s*=\s*["']([^"']+)/gi,
    /videoUrl\s*=\s*["']([^"']+)/gi,
  ];

  patterns.forEach(function (pattern) {
    var match;
    var htmlStr = html;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(htmlStr)) !== null) {
      var url = match[1];
      if (url && url.startsWith("http") && streams.every((s) => s.url !== url)) {
        var isM3u8 = url.includes(".m3u8");
        streams.push({
          name: "Sinewix",
          title: (isM3u8 ? "HD · m3u8" : "MP4") + " Sinewix",
          url: url,
          quality: isM3u8 ? "HD" : "SD",
          headers: {
            Referer: pageUrl,
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
          },
        });
      }
    }
  });

  // Video player data attribute
  $("[data-source],[data-video],[data-stream],[data-hls]").each(function (i, el) {
    var src =
      $(el).attr("data-source") ||
      $(el).attr("data-video") ||
      $(el).attr("data-stream") ||
      $(el).attr("data-hls") ||
      "";
    if (src && src.startsWith("http") && streams.every((s) => s.url !== src)) {
      streams.push({
        name: "Sinewix",
        title: "HD · Sinewix",
        url: src,
        quality: "HD",
        headers: {
          Referer: pageUrl,
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
        },
      });
    }
  });

  console.log("[Sinewix] Found", streams.length, "streams from", pageUrl);
  return streams;
}

module.exports = { getStreams };
