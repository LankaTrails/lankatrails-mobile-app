# AddToTripButton Component

A reusable React Native component for adding services to trips with modal flow for trip creation.

## Features

- Add to existing trips with day and time selection
- Create new trips with destination and trip details flow
- Animated modal interactions
- Customizable button appearance
- Toast notifications for user feedback

## Props

| Prop          | Type         | Default                | Description                                                |
| ------------- | ------------ | ---------------------- | ---------------------------------------------------------- |
| `onTripAdded` | `() => void` | `undefined`            | Callback function called when a trip is successfully added |
| `serviceName` | `string`     | `undefined`            | Name of the service being added to the trip                |
| `className`   | `string`     | Default button styling | Custom CSS classes for the button                          |
| `style`       | `any`        | `undefined`            | Custom inline styles for the button                        |
| `buttonText`  | `string`     | `"Add to Trip"`        | Text displayed on the button                               |
| `addedText`   | `string`     | `"Booked"`             | Text displayed after trip is added                         |

## Usage

### Basic Usage

```tsx
import AddToTripButton from "@/components/AddToTripButton";

<AddToTripButton
  serviceName="Transport Service"
  onTripAdded={() => {
    console.log("Trip added successfully");
  }}
/>;
```

### Custom Styling

```tsx
<AddToTripButton
  serviceName="Hotel Booking"
  className="mx-4 py-2 bg-blue-500 rounded-lg"
  buttonText="Book Now"
  addedText="Booked!"
  onTripAdded={() => {
    // Handle trip added logic
    showSuccessMessage();
  }}
/>
```

### With Custom Styles

```tsx
<AddToTripButton
  serviceName="Activity"
  style={{
    marginHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ff6b6b",
    borderRadius: 25,
  }}
  onTripAdded={() => {
    // Custom logic here
  }}
/>
```

## Modal Flow

The component handles three types of flows:

1. **Add to Existing Trip**: Select existing trip → Select day → Select time → Confirm
2. **Create New Trip**: Select destinations → Name trip → Set trip details → Confirm
3. **Sequential Modals**: Smooth transitions between destination, trip name, and trip details modals

## Dependencies

- `@react-native-community/datetimepicker`: For time selection
- `DestinationModal`: For destination selection in new trip flow
- `TripNameModal`: For naming new trips
- `TripDetailsModal`: For setting trip details

## Integration with Other Service Pages

This component can be easily integrated into other service detail pages:

- `accommodation/[serviceId].tsx`
- `activity/[serviceId].tsx`
- `food-beverage/[serviceId].tsx`
- `tour-guide/[serviceId].tsx`

Simply import and use with appropriate service information.
