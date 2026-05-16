
export interface DeviceLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'default';
}

const DEFAULT_LOCATION: DeviceLocation = { lat: -6.7924, lng: 39.2083, source: 'default' }; // Dar es Salaam

export async function detectPreciseLocation(): Promise<DeviceLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      detectIPLocation().then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'gps'
        });
      },
      async (err) => {
        console.warn("GPS Location failed:", err.message);
        const ipLoc = await detectIPLocation();
        resolve(ipLoc);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

export async function detectIPLocation(): Promise<DeviceLocation> {
  const apis = [
    { url: 'https://ipapi.co/json/', lat: 'latitude', lng: 'longitude' },
    { url: 'https://geolocation-db.com/json/', lat: 'latitude', lng: 'longitude' },
    { url: 'https://freeipapi.com/api/json', lat: 'latitude', lng: 'longitude' }
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) continue;
      const data = await res.json();
      
      const lat = data[api.lat];
      const lng = data[api.lng];
      
      if (lat && lng) {
        return { lat: Number(lat), lng: Number(lng), source: 'ip' };
      }
    } catch (e) {
      console.warn(`IP Geolocation fallback failed for ${api.url}`);
    }
  }

  return DEFAULT_LOCATION;
}
