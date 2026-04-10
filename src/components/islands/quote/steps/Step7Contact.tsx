import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import { submitLead } from '../submitLead';
import { AddressAutocomplete } from '../AddressAutocomplete';

/**
 * Step 7 — Contact capture. The ONLY screen that asks for personal info.
 *
 * Per master-build-plan §5: this step is reached AFTER the reveal screen,
 * so the user already saw their numbers before being asked for contact.
 * The button copy is "Send My Cash Card" — they're "sending" something
 * they already have, not "submitting" something they're hoping to get.
 *
 * Address autocomplete: master plan calls for Google Places. Wave 2 ships
 * with a manual text input fallback (allowed per Section 8 edge cases).
 * The Places API can be wired in W3 once we have a key.
 */

const ContactSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Required')
    .max(80, 'Too long'),
  phone: z
    .string()
    .min(7, 'Looks too short')
    .max(32, 'Too long')
    .regex(/^[0-9+()\-\s]+$/, 'Numbers only'),
  email: z.string().email('Not a valid email').max(254),
  propertyAddress: z
    .string()
    .min(5, 'Required')
    .max(300, 'Too long'),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

export function Step7Contact() {
  const state = useStore(cashCardStore);
  const { contact } = formSteps;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      firstName: state.firstName,
      phone: state.phone,
      email: state.email,
      propertyAddress: state.propertyAddress,
    },
    mode: 'onBlur',
  });

  async function onSubmit(values: ContactFormValues) {
    cashCardActions.setContact(values);
    cashCardActions.setSubmitting(true);
    const result = await submitLead({ ...cashCardStore.get(), ...values });
    if (result.ok) {
      cashCardActions.setSubmittedAt(new Date().toISOString());
      cashCardActions.setSubmitting(false);
      cashCardActions.next();
    } else {
      cashCardActions.setSubmitError(result.error);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {contact.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">{contact.microcopy}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {contact.fields.firstName}
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            {...register('firstName')}
            className="mt-1 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-accent">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {contact.fields.phone}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register('phone')}
            className="mt-1 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-accent">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {contact.fields.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-accent">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="propertyAddress"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {contact.fields.address}
          </label>
          <Controller
            name="propertyAddress"
            control={control}
            render={({ field }) => (
              <AddressAutocomplete
                id="propertyAddress"
                name={field.name}
                defaultValue={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ariaInvalid={Boolean(errors.propertyAddress)}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
            )}
          />
          {errors.propertyAddress && (
            <p className="mt-1 text-xs text-red-accent">
              {errors.propertyAddress.message}
            </p>
          )}
        </div>

        {state.submitError && (
          <div
            role="alert"
            className="rounded-xl border border-red-accent/30 bg-red-accent/5 px-4 py-3 text-sm text-red-accent"
          >
            {state.submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={state.submitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-accent px-8 py-4 text-base font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.submitting ? 'Sending…' : contact.submitLabel}
        </button>
      </form>
    </div>
  );
}
