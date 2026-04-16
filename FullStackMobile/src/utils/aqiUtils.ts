export interface AQICategory {
  level: string;
  color: string;
  bgColor: string;
  textColor: string;
  message: string;
}

export const getAQICategory = (aqi: number): AQICategory => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      color: '#22c55e',
      bgColor: 'bg-green-500',
      textColor: 'text-green-700',
      message: 'Air quality is satisfactory, and air pollution poses little or no risk.'
    };
  } else if (aqi <= 100) {
    return {
      level: 'Satisfactory',
      color: '#84cc16',
      bgColor: 'bg-lime-500',
      textColor: 'text-lime-700',
      message: 'Air quality is acceptable. However, there may be a risk for some people.'
    };
  } else if (aqi <= 200) {
    return {
      level: 'Moderate',
      color: '#eab308',
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      message: 'Members of sensitive groups may experience health effects.'
    };
  } else if (aqi <= 300) {
    return {
      level: 'Poor',
      color: '#f97316',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-700',
      message: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'
    };
  } else if (aqi <= 400) {
    return {
      level: 'Very Poor',
      color: '#ef4444',
      bgColor: 'bg-red-500',
      textColor: 'text-red-700',
      message: 'Health alert: The risk of health effects is increased for everyone.'
    };
  } else {
    return {
      level: 'Severe',
      color: '#991b1b',
      bgColor: 'bg-red-800',
      textColor: 'text-red-900',
      message: 'Health warning of emergency conditions: everyone is more likely to be affected.'
    };
  }
};

export interface Area {
  name: string;
  aqi: number;
  lat: number;
  lng: number;
}

export const nashikAreas: Area[] = [
  { name: 'Cidco', aqi: 85, lat: 19.9975, lng: 73.7898 },
  { name: 'Nashik Road', aqi: 120, lat: 20.0063, lng: 73.7898 },
  { name: 'College Road', aqi: 95, lat: 19.9872, lng: 73.7956 },
  { name: 'Gangapur Road', aqi: 145, lat: 20.0144, lng: 73.7679 },
  { name: 'Satpur', aqi: 185, lat: 20.0203, lng: 73.7679 },
  { name: 'Panchavati', aqi: 78, lat: 19.9955, lng: 73.7956 },
  { name: 'Old Agra Road', aqi: 165, lat: 19.9831, lng: 73.7679 },
  { name: 'Dwarka', aqi: 92, lat: 19.9747, lng: 73.7898 },
  { name: 'Ashok Stambh', aqi: 110, lat: 19.9912, lng: 73.7820 },
  { name: 'Makhmalabad', aqi: 135, lat: 20.0089, lng: 73.7820 },
];

export interface HourlyAQI {
  time: string;
  hour: number;
  aqi: number;
}

export const generateHourlyData = (baseAqi: number): HourlyAQI[] => {
  const data: HourlyAQI[] = [];
  for (let i = 0; i < 24; i++) {
    const variation = Math.floor(Math.random() * 40) - 20;
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      hour: i,
      aqi: Math.max(0, baseAqi + variation)
    });
  }
  return data;
};

export interface Pollutant {
  name: string;
  concentration: number;
  unit: string;
  aqiSubIndex: number;
}

export const getPollutants = (baseAqi: number): Pollutant[] => {
  const factor = baseAqi / 100;
  return [
    { name: 'PM2.5', concentration: Math.round(35 * factor), unit: 'µg/m³', aqiSubIndex: Math.round(95 * factor) },
    { name: 'PM10', concentration: Math.round(50 * factor), unit: 'µg/m³', aqiSubIndex: Math.round(85 * factor) },
    { name: 'CO', concentration: parseFloat((1.2 * factor).toFixed(2)), unit: 'mg/m³', aqiSubIndex: Math.round(65 * factor) },
    { name: 'NO₂', concentration: Math.round(40 * factor), unit: 'µg/m³', aqiSubIndex: Math.round(78 * factor) },
    { name: 'SO₂', concentration: Math.round(20 * factor), unit: 'µg/m³', aqiSubIndex: Math.round(55 * factor) },
    { name: 'O₃', concentration: Math.round(45 * factor), unit: 'µg/m³', aqiSubIndex: Math.round(88 * factor) },
    { name: 'NH₃', concentration: Math.round(15 * factor), unit: 'µg/m³', aqiSubIndex: Math.round(42 * factor) },
  ];
};
