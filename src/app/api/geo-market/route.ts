import { marketFromGeo } from "@/lib/founder-offer";

function firstHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = headers.get(name);
    if (value) return value;
  }
  return null;
}

function decodeHeader(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(request: Request) {
  const city = decodeHeader(
    firstHeader(request.headers, ["x-vercel-ip-city", "x-geo-city", "x-city"])
  );
  const region = decodeHeader(
    firstHeader(request.headers, [
      "x-vercel-ip-country-region",
      "x-geo-region",
      "x-region-code",
    ])
  );
  const countryCode = firstHeader(request.headers, [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country-code",
    "x-geo-country",
  ]);
  const market = marketFromGeo({ city, region, countryCode });

  return Response.json(
    { market },
    {
      headers: {
        "Cache-Control": "private, max-age=3600",
        Vary: [
          "x-vercel-ip-city",
          "x-vercel-ip-country-region",
          "x-vercel-ip-country",
          "cf-ipcountry",
        ].join(", "),
      },
    }
  );
}
