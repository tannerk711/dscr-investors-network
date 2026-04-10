/**
 * Minimal ambient typings for the slice of google.maps.places we touch
 * inside AddressAutocomplete.tsx. Adding the full @types/google.maps
 * package would pull in ~3MB of definitions for one Autocomplete call.
 *
 * If we ever need more of the Maps API, swap this for the official
 * `@types/google.maps` package and delete the file.
 */
declare namespace google.maps {
  namespace event {
    function clearInstanceListeners(instance: object): void;
  }
  namespace places {
    interface AutocompleteOptions {
      types?: string[];
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
    }
    interface PlaceResult {
      formatted_address?: string;
    }
    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(eventName: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }
  }
}
