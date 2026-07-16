export function convertKelvinToCelsius(kelvin: number): number {
  const tempCelsius = kelvin - 273.15;
  return Math.round(tempCelsius);
}

export function convertKelvinToFahrenheit(kelvin: number): number {
  const tempCelsius = kelvin - 273.15;
  const tempFahrenheit = (tempCelsius * 9) / 5 + 32;
  return Math.round(tempFahrenheit);
}

export function convertTemp(
  kelvin: number,
  unit: "C" | "F"
): number {
  return unit === "F"
    ? convertKelvinToFahrenheit(kelvin)
    : convertKelvinToCelsius(kelvin);
}