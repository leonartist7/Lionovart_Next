"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  founderOfferCopy,
  isFounderMarket,
  marketFromPath,
  marketFromTimezone,
  type FounderMarket,
} from "@/lib/founder-offer";

const MARKET_STORAGE_KEY = "lionovart-founder-market:v1";
const SPLASH_COMPLETE_EVENT = "lionovart:splash-complete";

interface CachedMarket {
  market: FounderMarket;
  expiresAt: number;
}

function readCachedMarket(): FounderMarket | null {
  try {
    const cached = JSON.parse(
      window.localStorage.getItem(MARKET_STORAGE_KEY) ?? "null"
    ) as CachedMarket | null;

    return cached &&
      cached.expiresAt > Date.now() &&
      isFounderMarket(cached.market)
      ? cached.market
      : null;
  } catch {
    return null;
  }
}

function cacheMarket(market: FounderMarket, days = 7) {
  try {
    window.localStorage.setItem(
      MARKET_STORAGE_KEY,
      JSON.stringify({
        market,
        expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
      } satisfies CachedMarket)
    );
  } catch {
    // Personalization is an enhancement; storage failures keep the global offer.
  }
}

export default function FounderOfferBanner() {
  const { locale } = useLanguage();
  const [market, setMarket] = useState<FounderMarket>("global");
  const [isRevealed, setIsRevealed] = useState(false);
  const copy = founderOfferCopy(locale, market);

  useEffect(() => {
    let revealFrame = 0;
    const reveal = () => {
      window.cancelAnimationFrame(revealFrame);
      revealFrame = window.requestAnimationFrame(() => setIsRevealed(true));
    };

    window.addEventListener(SPLASH_COMPLETE_EVENT, reveal);

    if (document.documentElement.dataset.splashComplete === "true") {
      reveal();
    }

    return () => {
      window.removeEventListener(SPLASH_COMPLETE_EVENT, reveal);
      window.cancelAnimationFrame(revealFrame);
    };
  }, []);

  useEffect(() => {
    let marketFrame = 0;
    const applyMarket = (nextMarket: FounderMarket) => {
      window.cancelAnimationFrame(marketFrame);
      marketFrame = window.requestAnimationFrame(() => setMarket(nextMarket));
    };
    const url = new URL(window.location.href);
    const requestedMarket = url.searchParams.get("market");
    const explicitMarket = isFounderMarket(requestedMarket)
      ? requestedMarket
      : marketFromPath(url.pathname);

    if (explicitMarket) {
      applyMarket(explicitMarket);
      cacheMarket(explicitMarket, 30);
      return () => window.cancelAnimationFrame(marketFrame);
    }

    const cachedMarket = readCachedMarket();
    if (cachedMarket) {
      applyMarket(cachedMarket);
      return () => window.cancelAnimationFrame(marketFrame);
    }

    const timezoneMarket = marketFromTimezone(
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
    );
    applyMarket(timezoneMarket);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1400);

    void fetch("/api/geo-market", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { market?: string } | null) => {
        if (result?.market && isFounderMarket(result.market)) {
          applyMarket(result.market);
          cacheMarket(result.market);
        } else {
          cacheMarket(timezoneMarket, 1);
        }
      })
      .catch(() => cacheMarket(timezoneMarket, 1))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(marketFrame);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.founderMarket = market;
  }, [market]);

  const focusOffer = () => {
    const input = document.getElementById("hero-blueprint-email") as HTMLInputElement | null;
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => input?.focus({ preventScroll: true }), 500);
  };

  return (
    <aside
      className={`relative z-[60] flex h-10 w-full shrink-0 items-center overflow-hidden bg-brand-red text-white transition-[opacity,transform] duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        isRevealed
          ? "translate-y-0 opacity-100 delay-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      aria-label={copy.aria}
      aria-hidden={!isRevealed}
      data-founder-market={market}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_15%,rgba(255,255,255,0.10)_50%,transparent_85%)]"
      />
      <button
        type="button"
        onClick={focusOffer}
        tabIndex={isRevealed ? 0 : -1}
        className="group relative flex h-full w-full items-center justify-center px-3 font-clash text-[9px] font-semibold uppercase tracking-[0.08em] min-[390px]:text-[10px] min-[390px]:tracking-[0.11em] lg:text-[10px] lg:tracking-[0.13em] xl:text-[11px] xl:tracking-[0.16em]"
      >
        <span className="block max-w-full truncate lg:hidden">
          {copy.marketMobile} <span className="mx-1 text-[#f0c917]">·</span> {copy.mobile}
          <span className="ml-1.5 whitespace-nowrap">
            <span className="hidden min-[390px]:inline">{copy.cta} </span>→
          </span>
        </span>
        <span className="hidden items-center lg:flex">
          <span>{copy.market}</span>
          <span className="mx-2.5 text-[#f0c917]">·</span>
          <span>{copy.desktop}</span>
          <span className="mx-2.5 text-[#f0c917]">·</span>
          <span className="whitespace-nowrap underline decoration-white/40 underline-offset-4 transition-[text-underline-offset,decoration-color] group-hover:decoration-white group-hover:underline-offset-[6px]">
            {copy.cta} →
          </span>
        </span>
      </button>
    </aside>
  );
}
