"use client";
/* eslint-disable @next/next/no-img-element */

import Navbar from "@/src/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../components/Container";
import { format, fromUnixTime, parseISO } from "date-fns";
import { enUS, de } from "date-fns/locale";
import { WeatherDatails } from "../components/WeatherDetails";
import {
  covertInMetersPerSecond,
  meterToKilometer,
} from "../utils/meterToKilometer";
import { ForcastWeatherDatails } from "../components/ForcarWeatherDetails";
import { useAtomValue } from "jotai";
import { placeAtom, unitAtom } from "./atom";
import { useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { TodayWeatherHero } from "../components/TodayWeatherHero";
import { TodayHourlyStrip } from "../components/TodayHourlyStrip";

// https://api.openweathermap.org/data/2.5/forecast?q=<city_name>&appid=<api_key>&cnt=56
export default function Home() {
  const place = useAtomValue(placeAtom);
  const unit = useAtomValue(unitAtom);
  const { locale, t } = useTranslation();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["weatherData"],
    queryFn: () =>
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_API_KEY}&cnt=56`
      ).then((res) => res.json()),
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">{t("loading")}</p>
      </div>
    );
  if (error) return <div>{t("errorLoading")}</div>;

  // Defensive guard: if the API returned an error payload (e.g. 401 from a
  // missing `NEXT_PUBLIC_API_KEY` on Vercel) or an empty `list`, show the
  // localized error message instead of crashing on `data.list[0]`.
  if (!data?.list?.length) {
    return (
      <div className="flex items-center min-h-screen justify-center px-4 text-center">
        <p className="text-red-600 dark:text-red-400 max-w-md">
          {t("errorLoading")}
        </p>
      </div>
    );
  }

  const firstDate = new Date(data.list[0].dt_txt);
  const firstData = data?.list[0];
  const dateLocale = locale === "de" ? de : enUS;

  const uniqueDates = Array.from(
    new Set(
      data.list.map(
        (entry: { dt: number }) =>
          new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  );

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data.list.find((entry: { dt: number }) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 0;
    });
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-200 via-cyan-100 to-teal-200 dark:from-sky-950 via-cyan-950 to-teal-950">
      <Navbar />
      {place && (
        <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
          <section>
            <div className="flex flex-col gap-6 mt-10">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                {format(firstDate, "EEEE, d. MMMM yyyy", { locale: dateLocale })}
              </h2>
              <TodayWeatherHero data={firstData} unit={unit} t={t} />
              <TodayHourlyStrip
                list={data.list}
                dateLocale={dateLocale}
                unit={unit}
              />
            </div>
            <div className="flex gap-4 mt-6">
              <Container className="w-fit justify-center flex-col px-4 items-center">
                <p className="text-center capitalize">
                  {firstData?.weather[0].description}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${firstData.weather[0].icon}.png`}
                  alt={firstData.weather[0].description}
                />
              </Container>
              <Container className="bg-yellow-300/80 dark:bg-yellow-900/30 px-6 gap-4 justify-between overflow-x-auto">
                <WeatherDatails
                  visability={meterToKilometer(firstData?.visability ?? 10000)}
                  visibilityLabel={t("visibility")}
                  humidity={`${firstData.main.humidity}%`}
                  windSpeed={`${covertInMetersPerSecond(
                    firstData.wind.speed ?? 1.84
                  )}`}
                  airPressure={`${firstData?.main.pressure} hPa`}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1702949452),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1702517657),
                    "H:mm"
                  )}
                  humidityLabel={t("humidity")}
                  windSpeedLabel={t("windSpeed")}
                  airPressureLabel={t("airPressure")}
                  sunriseLabel={t("sunrise")}
                  sunsetLabel={t("sunset")}
                />
              </Container>
            </div>
          </section>
          {/* 5 day forecast */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {t("forecast")}
            </h2>
            {firstDataForEachDate.map((d, i) => (
              <ForcastWeatherDatails
                key={i}
                description={d?.weather[0].description ?? ""}
                weatherIcon={d?.weather[0].icon ?? "01d"}
                date={d ? format(parseISO(d.dt_txt), "dd.MM") : ""}
                day={d ? format(parseISO(d.dt_txt), "EEEE", { locale: dateLocale }) : ""}
                feels_like={d?.main.feels_like ?? 0}
                temp={d?.main.temp ?? 0}
                temp_max={d?.main.temp_max ?? 0}
                temp_min={d?.main.temp_min ?? 0}
                airPressure={`${d?.main.pressure} hPa `}
                humidity={`${d?.main.humidity}% `}
                sunrise={format(
                  fromUnixTime(data?.city.sunrise ?? 1702517657),
                  "H:mm"
                )}
                sunset={format(
                  fromUnixTime(data?.city.sunset ?? 1702517657),
                  "H:mm"
                )}
                visability={`${meterToKilometer(d?.visibility ?? 10000)} `}
                windSpeed={`${covertInMetersPerSecond(d?.wind.speed ?? 1.64)} `}
              />
            ))}
          </section>
        </main>
      )}
    </div>
  );
}