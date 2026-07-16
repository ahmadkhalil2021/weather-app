/* eslint-disable @next/next/no-img-element */
import { Container } from "./Container";
import { convertTemp } from "../utils/convertKelvinToCelsius";
import { TranslationKey } from "../i18n/translations";

export interface TodayData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: ReadonlyArray<{ icon: string; description: string }>;
}

type Props = {
  data: TodayData | undefined;
  unit: "C" | "F";
  /** Pass through to useTranslation's `t` so labels stay localized. */
  t: (key: TranslationKey) => string;
};

export function TodayWeatherHero({ data, unit, t }: Props) {
  const temp = convertTemp(data?.main?.temp ?? 296.37, unit);
  const feelsLike = convertTemp(data?.main?.feels_like ?? 296.37, unit);
  const minTemp = convertTemp(data?.main?.temp_min ?? 296.37, unit);
  const maxTemp = convertTemp(data?.main?.temp_max ?? 296.37, unit);
  const icon = data?.weather[0]?.icon ?? "01d";
  const description = data?.weather[0]?.description ?? "";

  return (
    <Container className="glass-strong bg-white/30 dark:bg-black/40 px-6 sm:px-10 py-8 sm:py-10 items-stretch justify-between flex-col sm:flex-row gap-6 relative overflow-hidden">
      {/* Left column: focal temperature + chips */}
      <div className="flex flex-col items-center sm:items-start z-10 min-w-0">
        <p className="text-lg sm:text-xl font-medium capitalize text-gray-700 dark:text-gray-200 truncate max-w-full">
          {description}
        </p>

        <div className="flex items-start mt-1 text-gray-900 dark:text-white">
          <span className="text-7xl sm:text-9xl font-extrabold tracking-tighter tabular-nums leading-none">
            {temp}
          </span>
          <span className="text-3xl sm:text-5xl font-bold mt-1 sm:mt-3 ml-1 opacity-70">
            °{unit}
          </span>
        </div>

        <p className="text-base sm:text-lg font-medium opacity-80 mt-2 text-gray-700 dark:text-gray-200">
          {t("feelsLike")} {feelsLike}°{unit}
        </p>

        {/* Min / Max chips */}
        <div className="flex gap-3 mt-5">
          <div className="glass-soft bg-white/40 dark:bg-black/40 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 text-gray-800 dark:text-gray-100">
            <span className="text-blue-600 dark:text-blue-400">↓</span> {minTemp}° {t("min")}
          </div>
          <div className="glass-soft bg-white/40 dark:bg-black/40 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 text-gray-800 dark:text-gray-100">
            <span className="text-red-600 dark:text-red-400">↑</span> {maxTemp}° {t("max")}
          </div>
        </div>
      </div>

      {/* Right column: large weather icon */}
      <div className="w-40 h-40 sm:w-56 sm:h-56 flex-shrink-0 self-center sm:self-auto aspect-square relative z-10">
        <img
          src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
          alt={description}
          className="w-full h-full object-contain scale-110 drop-shadow-[0_15px_25px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_15px_25px_rgba(0,0,0,0.55)]"
        />
      </div>
    </Container>
  );
}
