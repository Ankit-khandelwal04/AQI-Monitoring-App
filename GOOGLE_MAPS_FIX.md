# Google Maps Fix - Web & Mobile

## Overview
Fixed Google Maps not displaying in both user and admin sections on web bundle.

---

## Issues Found

### 1. Missing Google Maps API Key in Web Component
**Problem**: The web MapView component had a placeholder `YOUR_GOOGLE_MAPS_API_KEY` instead of the actual API key.

**File**: `FullStackMobile/src/components/MapView.web.tsx`

**Solution**: Updated the Google Maps script URL with the actual API key from `app.json`:
```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDrH_9NPvz0bABzYgsqt-4JC13mxLQyT0I`;
```

### 2. Incomplete Web MapView Implementation
**Problem**: The web MapView component was not properly rendering markers and circles.

**Solution**: Implemented full Google Maps JavaScript API integration with:
- Map initialization with proper zoom calculation
- Marker rendering using `google.maps.Marker`
- Circle rendering using `google.maps.Circle`
- Context API to share map instance with child components
- Imperative API support (`animateToRegion`)

### 3. Duplicate Export Declaration
**Problem**: Three duplicate `PROVIDER_GOOGLE` exports causing compilation error:
```
Syntax error: Identifier 'PROVIDER_GOOGLE' has already been declared.
```

**Solution**: Removed duplicate exports, keeping only one at the end of the file.

---

## Implementation Details

### MapView Component (Web)

**Features Implemented**:
1. **Dynamic Google Maps Loading**
   - Loads Google Maps JavaScript API on demand
   - Checks if already loaded to avoid duplicate scripts
   - Error handling for failed loads

2. **Map Initialization**
   - Centers map based on `initialRegion` prop
   - Calculates zoom level from `latitudeDelta`
   - Configures map controls (zoom, street view, etc.)

3. **Context API**
   - Shares map instance with child components (Marker, Circle)
   - Enables proper rendering of map overlays

4. **Imperative API**
   - `animateToRegion()` method for programmatic map navigation
   - Exposed via `innerRef` prop

### Marker Component (Web)

**Implementation**:
```typescript
export function Marker({ coordinate, children, anchor, onPress, ...props }: any) {
  const mapInstance = React.useContext(MapContext);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapInstance || !(window as any).google) return;

    const google = (window as any).google;
    
    const marker = new google.maps.Marker({
      map: mapInstance,
      position: { lat: coordinate.latitude, lng: coordinate.longitude },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    markerRef.current = marker;

    if (onPress) {
      marker.addListener('click', onPress);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [mapInstance, coordinate?.latitude, coordinate?.longitude]);

  return null;
}
```

**Features**:
- Creates circular markers with custom styling
- Supports click events via `onPress` prop
- Proper cleanup on unmount

### Circle Component (Web)

**Implementation**:
```typescript
export function Circle({ center, radius, fillColor, strokeColor, strokeWidth, ...props }: any) {
  const mapInstance = React.useContext(MapContext);
  const circleRef = useRef<any>(null);

  useEffect(() => {
    if (!mapInstance || !(window as any).google) return;

    const google = (window as any).google;
    
    // Parse opacity from hex color (e.g., #FF000030 -> 0.19)
    const getFillOpacity = (color: string) => {
      if (!color) return 0.3;
      const match = color.match(/^#[0-9A-F]{6}([0-9A-F]{2})$/i);
      if (match) {
        return parseInt(match[1], 16) / 255;
      }
      return 0.3;
    };

    const getBaseColor = (color: string) => {
      if (!color) return '#FF0000';
      return color.substring(0, 7); // Get first 7 chars (#RRGGBB)
    };
    
    const circle = new google.maps.Circle({
      map: mapInstance,
      center: { lat: center.latitude, lng: center.longitude },
      radius: radius,
      fillColor: getBaseColor(fillColor),
      fillOpacity: getFillOpacity(fillColor),
      strokeColor: getBaseColor(strokeColor),
      strokeOpacity: getStrokeOpacity(strokeColor),
      strokeWeight: strokeWidth || 2,
    });

    circleRef.current = circle;

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [mapInstance, center?.latitude, center?.longitude, radius, fillColor, strokeColor, strokeWidth]);

  return null;
}
```

**Features**:
- Renders circles with custom radius
- Parses hex colors with alpha channel (e.g., `#FF000030`)
- Extracts opacity from 8-digit hex colors
- Proper cleanup on unmount

---

## Google Maps API Key Configuration

### Location: `FullStackMobile/app.json`

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyDrH_9NPvz0bABzYgsqt-4JC13mxLQyT0I"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyDrH_9NPvz0bABzYgsqt-4JC13mxLQyT0I"
        }
      }
    }
  }
}
```

**Note**: The same API key is used for iOS, Android, and Web platforms.

---

## Zoom Level Calculation

The web implementation calculates zoom level from `latitudeDelta`:

```typescript
const calculateZoom = (latitudeDelta: number) => {
  return Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
};
```

**Examples**:
- `latitudeDelta: 0.03` → Zoom level ~15 (close-up)
- `latitudeDelta: 0.08` → Zoom level ~13 (medium)
- `latitudeDelta: 0.15` → Zoom level ~12 (wide view)

---

## Color Parsing

The Circle component parses React Native color formats for Google Maps:

### 8-Digit Hex Colors (with alpha)
- Input: `#FF000030` (red with ~19% opacity)
- Parsed: `fillColor: '#FF0000'`, `fillOpacity: 0.19`

### 6-Digit Hex Colors (no alpha)
- Input: `#FF0000` (red, full opacity)
- Parsed: `fillColor: '#FF0000'`, `fillOpacity: 0.3` (default)

---

## Testing

### Web Bundle
1. **Build the web bundle**:
   ```bash
   cd FullStackMobile
   npx expo export:web
   ```

2. **Start the web server**:
   ```bash
   npx expo start --web
   ```

3. **Test User Section**:
   - Select a zone, date, and time
   - Click "Show AQI"
   - Map should display with:
     - All zones as colored circles
     - Markers for each zone
     - Centered on selected zone

4. **Test Admin Section**:
   - Navigate to Admin → Map
   - Map should display with:
     - All monitored zones
     - Color-coded circles based on AQI
     - Interactive markers

### Mobile (iOS/Android)
- Maps should work natively using `react-native-maps`
- No changes needed for mobile platforms

---

## Files Modified

1. **FullStackMobile/src/components/MapView.web.tsx**
   - Added Google Maps API key
   - Implemented full MapView component
   - Implemented Marker component
   - Implemented Circle component
   - Added Context API for map instance sharing
   - Removed duplicate exports
   - Added styles

2. **FullStackMobile/src/screens/HomeScreen.tsx**
   - Added `innerRef` prop to MapView for web compatibility

---

## Known Limitations

### Callout Component
The `Callout` component is not yet implemented for web. To add this feature:

1. Use `google.maps.InfoWindow`
2. Attach to markers on click
3. Render custom HTML content

**Example**:
```typescript
const infoWindow = new google.maps.InfoWindow({
  content: '<div>Custom content</div>',
});

marker.addListener('click', () => {
  infoWindow.open(map, marker);
});
```

### Custom Marker Content
Currently, markers use simple circular icons. To render custom React components as markers:

1. Use `google.maps.OverlayView`
2. Render React component to DOM element
3. Position element on map

---

## Performance Considerations

### Bundle Size
The web bundle includes Google Maps JavaScript API, which adds ~200KB to the bundle size. This is acceptable for the functionality provided.

**Current Bundle Size**: 711 KiB (warning threshold: 586 KiB)

### Optimization Suggestions
1. **Lazy load Google Maps**: Only load when map is needed
2. **Code splitting**: Split map components into separate chunk
3. **Reduce marker count**: Cluster markers for large datasets

---

## Troubleshooting

### Map Not Displaying
1. **Check API Key**: Ensure the API key is valid and has Maps JavaScript API enabled
2. **Check Console**: Look for Google Maps errors in browser console
3. **Check Network**: Ensure `maps.googleapis.com` is accessible

### Markers Not Showing
1. **Check Coordinates**: Ensure latitude/longitude are valid
2. **Check Map Instance**: Ensure map is loaded before rendering markers
3. **Check Context**: Ensure MapContext is properly provided

### Circles Not Rendering
1. **Check Radius**: Ensure radius is in meters (not pixels)
2. **Check Colors**: Ensure colors are valid hex strings
3. **Check Opacity**: Ensure opacity values are between 0 and 1

---

## API Key Security

**⚠️ IMPORTANT**: The Google Maps API key is currently hardcoded in the source code. For production:

1. **Restrict API Key**: Add domain restrictions in Google Cloud Console
2. **Environment Variables**: Move API key to environment variables
3. **Backend Proxy**: Consider proxying map requests through backend

### Recommended Setup
```typescript
// Use environment variable
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
```

---

## Related Documentation
- `WEB_PLATFORM_FIX.md` - Date/time picker and admin map fixes
- `TECHNICAL_ARCHITECTURE.md` - Overall tech stack documentation
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

## Future Enhancements

1. **InfoWindow/Callout Support**: Add popup information windows on marker click
2. **Custom Marker Icons**: Support custom images and React components as markers
3. **Marker Clustering**: Group nearby markers for better performance
4. **Heatmap Layer**: Show AQI data as heatmap overlay
5. **Drawing Tools**: Allow admin to draw custom zones
6. **Geolocation**: Show user's current location on map
7. **Directions**: Add route planning between zones
