// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import "@/app/globals.css";
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

// Only if you're using persistence (optional)
const persistor = persistStore(store);

export default function RootLayout() {
  return (
    <Provider store={store}>
      {/* Remove AuthProvider since we're using Redux only */}
      {/* Optional: Add PersistGate if you want to persist your Redux state */}
      {/* <PersistGate loading={null} persistor={persistor}> */}
        <Stack screenOptions={{ headerShown: false }} />
      {/* </PersistGate> */}
    </Provider>
  );
}