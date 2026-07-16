import React from "react";
import { FiDroplet } from "react-icons/fi";
import { ImMeter } from "react-icons/im";
import { IoEyeOutline } from "react-icons/io5";
import { MdAir } from "react-icons/md";

export interface WeatherDetailProps {
  visability: string;
  humidity: string;
  windSpeed: string;
  airPressure: string;
  sunrise: string;
  sunset: string;
  // localized labels (optional, fall back to English)
  visibilityLabel?: string;
  humidityLabel?: string;
  windSpeedLabel?: string;
  airPressureLabel?: string;
  sunriseLabel?: string;
  sunsetLabel?: string;
}

export function WeatherDatails(props: WeatherDetailProps) {
  const visibilityLabel = props.visibilityLabel ?? "Visibility";
  const humidityLabel = props.humidityLabel ?? "Humidity";
  const windSpeedLabel = props.windSpeedLabel ?? "Wind Speed";
  const airPressureLabel = props.airPressureLabel ?? "Air Pressure";
  const sunriseLabel = props.sunriseLabel ?? "Sunrise";
  const sunsetLabel = props.sunsetLabel ?? "Sunset";

  return (
    <>
      <SingleWeatherDetails
        icon={<IoEyeOutline />}
        information={visibilityLabel}
        value={props.visability}
      />
      <SingleWeatherDetails
        icon={<FiDroplet />}
        information={humidityLabel}
        value={props.humidity}
      />
      <SingleWeatherDetails
        icon={<MdAir />}
        information={windSpeedLabel}
        value={props.windSpeed}
      />
      <SingleWeatherDetails
        icon={<ImMeter />}
        information={airPressureLabel}
        value={props.airPressure}
      />
      <SingleWeatherDetails
        icon={<FiDroplet />}
        information={sunriseLabel}
        value={props.sunrise}
      />
      <SingleWeatherDetails
        icon={<MdAir />}
        information={sunsetLabel}
        value={props.sunset}
      />
    </>
  );
}

export interface SingleWeatherDetailsProps {
  information: string;
  icon: React.ReactNode;
  value: string;
}

function SingleWeatherDetails(props: SingleWeatherDetailsProps) {
  const { information, icon, value } = props;
  return (
    <div className="flex flex-col items-center gap-2 justify-between text-xs font-semibold text-black/80 dark:text-gray-300">
      <p className="whitespace-nowrap">{information}</p>
      <div className="text-xl">{icon}</div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}