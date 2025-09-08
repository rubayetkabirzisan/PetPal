// Fix untyped function calls
declare module 'expo-router' {
  export function useLocalSearchParams<T>(): T;
}

// Fix MapView namespace issue
declare module 'react-native-maps' {
  export type MapViewType = any;
  export default class MapView extends React.Component<any, any> {
    static Marker: any;
    static Callout: any;
    static PROVIDER_GOOGLE: string;
    static PROVIDER_DEFAULT: string;
    animateToRegion: (region: any, duration?: number) => void;
  }
}
