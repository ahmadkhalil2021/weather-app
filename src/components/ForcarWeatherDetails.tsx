/* eslint-disable @next/next/no-img-element */
import { convertTemp } from "../utils/convertKelvinToCelsius";
import { Container } from "./Container";
import { WeatherDatails, WeatherDetailProps } from "./WeatherDetails";
import { useAtomValue } from "jotai";
import { unitAtom } from "../app/atom";
import { useTranslation } from "../hooks/useTranslation";

export interface ForecastWeatherDetailPros extends WeatherDetailProps {
  weatherIcon: string;
  date: string;
  day: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
}

export function ForcastWeatherDatails(props: ForecastWeatherDetailPros) {
  const unit = useAtomValue(unitAtom);
  const { t } = useTranslation();
  const {
    weatherIcon,
    date = "19.09",
    day = "Monday",
    temp,
    feels_like,
    description,
  } = props;
  return (
    <Container className="mt-8">
      <section className="flex gap-4 items-center px-4">
        <div className="flex flex-col gap-1 items-center">
          <img
            src={`https://openweathermap.org/img/wn/${weatherIcon}.png`}
            alt={weatherIcon}
          />
          <p>{date}</p>
          <p className="text-sm">{day}</p>
        </div>
        <div className="flex flex-col px-4">
          <span className="text-5xl">{convertTemp(temp ?? 0, unit)}°{unit}</span>
          <p className="text-xs space-x-1 whitespace-nowrap">
            <span> {t("feelsLike")}</span>
            <span>{convertTemp(feels_like ?? 0, unit)}°{unit}</span>
          </p>
          <p className="capitalize"> {description}</p>
        </div>
      </section>

      <section className="overflow-x-auto flex justify-between gap-4 px-4 w-full pr-18">
        <WeatherDatails
          {...props}
          visibilityLabel={t("visibility")}
          humidityLabel={t("humidity")}
          windSpeedLabel={t("windSpeed")}
          airPressureLabel={t("airPressure")}
          sunriseLabel={t("sunrise")}
          sunsetLabel={t("sunset")}
        />
      </section>
    </Container>
  );
}
