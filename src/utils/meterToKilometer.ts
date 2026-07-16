export function meterToKilometer(meters: number): string {
    const visibilityInKilometers = meters / 1000;

    return `${visibilityInKilometers.toFixed(0)} km`
}

export function covertInMetersPerSecond(speedInMeters: number): string {
    const speedInKilometersPerHour = speedInMeters * 3.5;

    return `${speedInKilometersPerHour.toFixed(0)} km/h`
}

