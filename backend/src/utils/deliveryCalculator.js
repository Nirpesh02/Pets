export const calculateDeliveryCharge = (zoneId, subtotal) => {
  // Free delivery for orders >= 6000 inside Kathmandu Valley
  if (subtotal >= 6000 && zoneId === 'valley_inside') {
    return 0;
  }

  switch (zoneId) {
    case 'valley_inside':
      return 100;
    case 'valley_outside':
      return 150;
    case 'outside_valley':
      return 250;
    default:
      return 100;
  }
};

export default calculateDeliveryCharge;
