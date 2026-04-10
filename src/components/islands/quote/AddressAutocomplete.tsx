import { useEffect, useId, useRef, useState } from 'react';

/**
 * Google Places Autocomplete address field with a clean manual fallback.
 *
 * Why hand-rolled instead of a library:
 *  - Every Places-React lib pulls the full @googlemaps/js-api-loader, which
 *    drags in roughly 80KB of types we don't need.
 *  - The native Places API needs ~30 lines of imperative wiring; building
 *    it ourselves keeps the form bundle lean and gives us total control
 *    over how the picked place flows back into react-hook-form.
 *
 * Behavior:
 *  - On mount, checks `import.meta.env.PUBLIC_GOOGLE_PLACES_API_KEY`.
 *  - If present, lazy-loads the Maps JS SDK exactly once across the app
 *    (script-tag dedup via window.__dscrPlacesLoading promise) and binds
 *    a `google.maps.places.Autocomplete` to the underlying input.
 *  - On place_changed, calls `onChange(formattedAddress)` so the parent
 *    react-hook-form sees a single string value — no PlaceResult leak.
 *  - If the API key is missing OR the SDK fails to load, the field still
 *    renders as a plain text input (allowed manual fallback per
 *    master-build-plan §8 edge cases).
 *  - Restricted to US country, types=address. No business POIs.
 */

declare global {
  interface Window {
    google?: typeof google;
    __dscrPlacesLoading?: Promise<void>;
  }
}

type Props = {
  id?: string;
  defaultValue?: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  ariaInvalid?: boolean;
  placeholder?: string;
  className?: string;
  /** Field name for react-hook-form `register` integration */
  name?: string;
};

const SCRIPT_ID = 'dscr-google-places-script';

function loadPlacesScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__dscrPlacesLoading) return window.__dscrPlacesLoading;

  window.__dscrPlacesLoading = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('places_script_failed')));
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('places_script_failed')));
    document.head.appendChild(script);
  });

  return window.__dscrPlacesLoading;
}

export function AddressAutocomplete({
  id,
  defaultValue = '',
  onChange,
  onBlur,
  ariaInvalid,
  placeholder = '123 Main St, City, ST 12345',
  className,
  name,
}: Props) {
  const reactId = useId();
  const inputId = id ?? `address-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [text, setText] = useState(defaultValue);
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.PUBLIC_GOOGLE_PLACES_API_KEY as
      | string
      | undefined;
    if (!apiKey) return; // manual fallback path
    let cancelled = false;

    loadPlacesScript(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places)
          return;
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address'],
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const formatted = place.formatted_address ?? '';
          if (formatted) {
            setText(formatted);
            onChange(formatted);
          }
        });
        autocompleteRef.current = ac;
        setPlacesReady(true);
      })
      .catch(() => {
        // Fallback path — leave as a normal text input.
        setPlacesReady(false);
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
    };
    // onChange is stable from react-hook-form's register; intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      id={inputId}
      name={name}
      type="text"
      autoComplete="street-address"
      placeholder={placeholder}
      aria-invalid={ariaInvalid || undefined}
      data-places-ready={placesReady ? 'true' : 'false'}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value);
      }}
      onBlur={onBlur}
      value={text}
      className={className}
    />
  );
}
