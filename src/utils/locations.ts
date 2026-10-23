export interface DeliveryLocation {
  name: string
  distance: number
}

export const DELIVERY_LOCATIONS: DeliveryLocation[] = [
  { name: 'Nairobi CBD', distance: 2 },
  { name: 'Upper Hill, Nairobi', distance: 5 },
  { name: 'Kilimani, Nairobi', distance: 6 },
  { name: 'Westlands, Nairobi', distance: 7 },
  { name: 'Parklands, Nairobi', distance: 8 },
  { name: 'Lavington, Nairobi', distance: 9 },
  { name: 'Karen, Nairobi', distance: 18 },
  { name: 'Kasarani, Nairobi', distance: 18 },
  { name: 'Ruiru, Kiambu', distance: 22 },
  { name: 'Juja Town, Kiambu', distance: 35 },
  { name: 'Juja Stage, Kiambu', distance: 36 },
  { name: 'Juja Farm, Kiambu', distance: 38 },
  { name: 'Thika Town, Kiambu', distance: 42 },
  { name: 'Kiambu Town', distance: 16 },
  { name: 'Nakuru Town', distance: 160 },
  { name: 'Eldoret Town', distance: 310 },
  { name: 'Mombasa CBD', distance: 480 },
]

export function findDeliveryLocations(search: string): DeliveryLocation[] {
  const normalized = search.trim().toLocaleLowerCase()
  if (!normalized) return []
  return DELIVERY_LOCATIONS.filter(location => location.name.toLocaleLowerCase().includes(normalized))
}
