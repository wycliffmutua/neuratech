export interface ShippingQuote {
  fee: number;
  estDelivery: string;
  distanceKm: number;
  isUpcountry: boolean;
}

/**
 * Calculates shipping fee and delivery timeframe based on location and distance from NeuraTech Hub (Nairobi CBD).
 */
export function calculateShippingQuote(
  locationName: string, 
  distanceKm: number, 
  subtotal: number
): ShippingQuote {
  const isNairobi = locationName.toLowerCase().includes("nairobi") || locationName.toLowerCase().includes("cbd");
  const isUpcountry = distanceKm > 50 || !isNairobi;

  // Rule 1: Free Shipping for orders >= KSh 10,000 in Nairobi
  if (isNairobi && subtotal >= 10000) {
    return {
      fee: 0,
      estDelivery: "Same Day / 1 Day",
      distanceKm,
      isUpcountry: false,
    };
  }

  // Rule 2: Tiered pricing by distance from Hub
  let fee = 100;
  let estDelivery = "1 Day";

  if (distanceKm <= 10) {
    fee = 100;
    estDelivery = "1 Day";
  } else if (distanceKm <= 15) {
    fee = 150;
    estDelivery = "1 Day";
  } else if (distanceKm <= 25) {
    fee = 200;
    estDelivery = "1 Day";
  } else if (distanceKm <= 35) {
    fee = 250;
    estDelivery = "1 Day";
  } else if (distanceKm <= 45) {
    fee = 300;
    estDelivery = "1–2 Days";
  } else {
    // Beyond 50km (Upcountry / Far locations)
    fee = 350 + Math.ceil((distanceKm - 50) / 10) * 50;
    estDelivery = "1–2 Business Days";
  }

  return { fee, estDelivery, distanceKm, isUpcountry };
}