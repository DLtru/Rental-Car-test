
const MIN_DRIVER_AGE = 18;
const MAX_COMPACT_ONLY_AGE = 21;
const MAX_RACER_SURCHARGE_AGE = 25;
const LONG_RENTAL_DAYS_THRESHOLD = 10;
const HIGH_SEASON_MULTIPLIER = 1.15;
const RACER_SURCHARGE_MULTIPLIER = 1.5;
const LONG_RENTAL_DISCOUNT_MULTIPLIER = 0.9;
const LICENSE_MIN_YEARS = 1;
const LICENSE_PRICE_INCREASE_YEARS = 2;
const LICENSE_PRICE_INCREASE_MULTIPLIER = 1.3;
const LICENSE_HIGH_SEASON_SURCHARGE_YEARS = 3;
const LICENSE_HIGH_SEASON_DAILY_SURCHARGE = 15;
const HIGH_SEASON_START_MONTH = 3; // April (0=Jan)
const HIGH_SEASON_END_MONTH = 9; // October (0=Jan)
const SEASON_HIGH = "High";
const SEASON_LOW = "Low";
const CLASS_COMPACT = "Compact";
const CLASS_ELECTRIC = "Electric";
const CLASS_CABRIO = "Cabrio";
const CLASS_RACER = "Racer";

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const driverAge = Number(age);
  const licenseYearsHeld = getNumericValue(licenseYears, 0);
  const carClass = getCarClass(type);
  const days = getRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (driverAge < MIN_DRIVER_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (licenseYearsHeld < LICENSE_MIN_YEARS) {
    return "Driver's license held for less than a year - cannot quote the price";
  }

  if (driverAge <= MAX_COMPACT_ONLY_AGE && carClass !== CLASS_COMPACT) {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  let rentalPrice = driverAge * days;

  if (carClass === CLASS_RACER && driverAge <= MAX_RACER_SURCHARGE_AGE && season === SEASON_HIGH) {
    rentalPrice *= RACER_SURCHARGE_MULTIPLIER;
  }

  if (season === SEASON_HIGH) {
    rentalPrice *= HIGH_SEASON_MULTIPLIER;
  }

  if (days > LONG_RENTAL_DAYS_THRESHOLD && season === SEASON_LOW) {
    rentalPrice *= LONG_RENTAL_DISCOUNT_MULTIPLIER;
  }

  if (season === SEASON_HIGH && licenseYearsHeld < LICENSE_HIGH_SEASON_SURCHARGE_YEARS) {
    rentalPrice += LICENSE_HIGH_SEASON_DAILY_SURCHARGE * days;
  }

  if (licenseYearsHeld < LICENSE_PRICE_INCREASE_YEARS) {
    rentalPrice *= LICENSE_PRICE_INCREASE_MULTIPLIER;
  }

  return `$${rentalPrice}`;
}

function getNumericValue(value, fallback) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function getCarClass(type) {
  switch (type) {
    case CLASS_COMPACT:
      return CLASS_COMPACT;
    case CLASS_ELECTRIC:
      return CLASS_ELECTRIC;
    case CLASS_CABRIO:
      return CLASS_CABRIO;
    case CLASS_RACER:
      return CLASS_RACER;
    default:
      return "Unknown";
  }
}

function getRentalDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
    (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
    (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
    (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH)
  ) {
    return SEASON_HIGH;
  }

  return SEASON_LOW;
}

exports.price = price;
