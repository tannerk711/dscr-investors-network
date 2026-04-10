import { z } from 'zod';

/**
 * Zod schemas enforcing the shape of every src/content/*.json file.
 * Components import from here so a content typo fails the build.
 */

export const HeroSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  ctaLabel: z.string().min(1),
  trustStrip: z.array(z.string().min(1)).length(3),
  mockCard: z.object({
    cashAtClose: z.string().min(1),
    cashFlow: z.string().min(1),
    timeline: z.string().min(1),
  }),
});
export type Hero = z.infer<typeof HeroSchema>;

export const FormStepsSchema = z.object({
  stateGate: z.object({
    headline: z.string(),
    states: z
      .array(
        z.object({
          code: z.string(),
          label: z.string(),
        })
      )
      .min(6),
    offStateExitCopy: z.string(),
  }),
  q1PropertyType: z.object({
    headline: z.string(),
    options: z
      .array(
        z.object({
          id: z.enum(['sfr', 'multi', 'condo', 'str']),
          label: z.string(),
          icon: z.string(),
        })
      )
      .length(4),
    otherKickoutCopy: z.string(),
  }),
  q2PropertyValue: z.object({
    headline: z.string(),
    min: z.number(),
    max: z.number(),
    step: z.number(),
    default: z.number(),
    minTooltip: z.string(),
    helperHint: z.string(),
  }),
  q3LoanBalance: z.object({
    headline: z.string(),
    step: z.number(),
    default: z.number(),
    freeAndClearCopy: z.string(),
  }),
  q4MonthlyRent: z.object({
    headline: z.string(),
    min: z.number(),
    max: z.number(),
    step: z.number(),
    default: z.number(),
    strHeadline: z.string(),
    strHint: z.string(),
  }),
  q5Fico: z.object({
    headline: z.string(),
    microcopy: z.string(),
    brackets: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          sublabel: z.string(),
          midpoint: z.number(),
        })
      )
      .length(5),
    below620KickoutCopy: z.string(),
  }),
  reveal: z.object({
    headline: z.string(),
    cashLineLabel: z.string(),
    cashFlowLineLabel: z.string(),
    timelineLine: z.string(),
    asterisk: z.string(),
    ctaLabel: z.string(),
  }),
  contact: z.object({
    headline: z.string(),
    fields: z.object({
      firstName: z.string(),
      phone: z.string(),
      email: z.string(),
      address: z.string(),
    }),
    microcopy: z.string(),
    submitLabel: z.string(),
  }),
});
export type FormSteps = z.infer<typeof FormStepsSchema>;

export const CashEngineConfigSchema = z.object({
  ficoAdjustment: z.number(),
  ltvBrackets: z
    .array(
      z.object({
        minFico: z.number(),
        ltvCap: z.number(),
      })
    )
    .min(2),
  feesHaircut: z.object({
    low: z.number(),
    high: z.number(),
  }),
  pitiPerHundredK: z.number(),
  strRevenueDiscount: z.number(),
  cashFlowRangeFactor: z.number(),
  edgeCaseThresholds: z.object({
    minCashOutDollars: z.number(),
    minPropertyValue: z.number(),
    minRent: z.number(),
  }),
});
export type CashEngineConfig = z.infer<typeof CashEngineConfigSchema>;

export const CaseStudiesSchema = z.object({
  headline: z.string(),
  studies: z
    .array(
      z.object({
        firstName: z.string(),
        city: z.string(),
        state: z.string(),
        propertyType: z.string(),
        cashOut: z.string(),
        monthlyCashFlow: z.string(),
        daysToClose: z.string(),
      })
    )
    .length(3),
});
export type CaseStudies = z.infer<typeof CaseStudiesSchema>;

export const FaqSchema = z.object({
  headline: z.string(),
  items: z
    .array(
      z.object({
        q: z.string(),
        a: z.string(),
      })
    )
    .min(1),
});
export type Faq = z.infer<typeof FaqSchema>;

export const ExclusionsSchema = z.object({
  headline: z.string(),
  items: z.array(z.string()).min(1),
  microcopy: z.string(),
});
export type Exclusions = z.infer<typeof ExclusionsSchema>;

export const LoBiosSchema = z.object({
  headline: z.string(),
  people: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        bio: z.string(),
        quote: z.string(),
        photoUrl: z.string(),
      })
    )
    .min(1),
});
export type LoBios = z.infer<typeof LoBiosSchema>;

export const ThankYouSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  loPlaceholder: z.object({
    name: z.string(),
    phone: z.string(),
    photoUrl: z.string(),
  }),
  fallbackEmailLine: z.string(),
  emailTemplate: z.object({
    subject: z.string(),
    previewText: z.string(),
  }),
});
export type ThankYou = z.infer<typeof ThankYouSchema>;

export const SalesforceSchemaSchema = z.object({
  webhookUrl: z.string(),
  fields: z.record(z.string(), z.string()),
});
export type SalesforceSchema = z.infer<typeof SalesforceSchemaSchema>;

export const RuleOfThumbSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  examples: z
    .array(
      z.object({
        loan: z.number(),
        rent: z.number(),
        result: z.string(),
      })
    )
    .min(1),
});
export type RuleOfThumb = z.infer<typeof RuleOfThumbSchema>;

export const ProcessSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  steps: z
    .array(
      z.object({
        n: z.number(),
        title: z.string(),
        body: z.string(),
      })
    )
    .length(4),
});
export type Process = z.infer<typeof ProcessSchema>;

export const FinalCtaSchema = z.object({
  headline: z.string(),
  ctaLabel: z.string(),
});
export type FinalCta = z.infer<typeof FinalCtaSchema>;

export const FooterSchema = z.object({
  nmls: z.string(),
  links: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    )
    .min(1),
  compliance: z.string(),
});
export type Footer = z.infer<typeof FooterSchema>;
