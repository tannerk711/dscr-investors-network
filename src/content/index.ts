/**
 * Single source of truth for content imports.
 * Every JSON file in src/content/ is parsed through its Zod schema here.
 * If a JSON file drifts from the schema, the build fails at this layer —
 * components downstream get fully-typed, validated data.
 */

import heroJson from './hero.json';
import formStepsJson from './form-steps.json';
import cashEngineConfigJson from './cash-engine-config.json';
import faqJson from './faq.json';
import exclusionsJson from './exclusions.json';
import loBiosJson from './lo-bios.json';
import thankYouJson from './thank-you.json';
import ruleOfThumbJson from './rule-of-thumb.json';
import processJson from './process.json';
import finalCtaJson from './final-cta.json';
import footerJson from './footer.json';
import corkboardJson from './corkboard.json';

import {
  HeroSchema,
  FormStepsSchema,
  CashEngineConfigSchema,
  FaqSchema,
  ExclusionsSchema,
  LoBiosSchema,
  ThankYouSchema,
  RuleOfThumbSchema,
  ProcessSchema,
  FinalCtaSchema,
  FooterSchema,
  CorkboardSchema,
} from './schemas';

export const hero = HeroSchema.parse(heroJson);
export const formSteps = FormStepsSchema.parse(formStepsJson);
export const cashEngineConfig = CashEngineConfigSchema.parse(cashEngineConfigJson);
export const faq = FaqSchema.parse(faqJson);
export const exclusions = ExclusionsSchema.parse(exclusionsJson);
export const loBios = LoBiosSchema.parse(loBiosJson);
export const thankYou = ThankYouSchema.parse(thankYouJson);
export const ruleOfThumb = RuleOfThumbSchema.parse(ruleOfThumbJson);
export const process = ProcessSchema.parse(processJson);
export const finalCta = FinalCtaSchema.parse(finalCtaJson);
export const footer = FooterSchema.parse(footerJson);
export const corkboard = CorkboardSchema.parse(corkboardJson);
