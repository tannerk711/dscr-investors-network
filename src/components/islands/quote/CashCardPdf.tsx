import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { formatUsd, formatMonthly } from './format';

/**
 * Client-side React-PDF document for the Cash Card download.
 *
 * Rendered to a Blob in the browser via @react-pdf/renderer's `pdf()`
 * helper, then turned into a download link in SuccessScreen. The same
 * shape is mirrored server-side by the Resend email attachment, which
 * means we keep one source of truth for what a "Cash Card" looks like.
 */

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#0F1C2E',
  },
  header: {
    fontSize: 10,
    color: '#1B2E4B',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1C2E',
    marginBottom: 32,
  },
  card: {
    border: '2pt solid #1B2E4B',
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B2E4B',
  },
  smallLabel: {
    fontSize: 10,
    color: '#5C6A7A',
    marginTop: 4,
  },
  divider: {
    borderBottom: '1pt solid #D9DDE4',
    marginVertical: 16,
  },
  cashFlow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D7A4F',
  },
  timeline: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F1C2E',
  },
  asterisk: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#8491A3',
    marginTop: 16,
  },
  meta: {
    marginTop: 32,
    fontSize: 10,
    color: '#5C6A7A',
    lineHeight: 1.5,
  },
});

export type CashCardPdfData = {
  firstName: string;
  cashLow: number;
  cashHigh: number;
  monthlyCashFlow: number;
  generatedAt: string;
};

export function CashCardPdfDocument({ data }: { data: CashCardPdfData }) {
  return (
    <Document
      title="Your DSCR Cash-Out Estimate"
      author="DSCR Investors Network"
      subject="Cash-out estimate"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.header}>DSCR Investors Network</Text>
        <Text style={styles.title}>{data.firstName}, here's your cash-out estimate</Text>

        <View style={styles.card}>
          <Text style={styles.bigNumber}>
            Up to {formatUsd(data.cashLow)} – {formatUsd(data.cashHigh)}
          </Text>
          <Text style={styles.smallLabel}>cash in your pocket at close</Text>

          <View style={styles.divider} />

          <Text style={styles.cashFlow}>{formatMonthly(data.monthlyCashFlow)}</Text>
          <Text style={styles.smallLabel}>new cash flow after the loan</Text>

          <View style={styles.divider} />

          <Text style={styles.timeline}>~20 business days from yes to wired</Text>

          <Text style={styles.asterisk}>
            * After typical closing fees. Final number depends on appraisal and
            title.
          </Text>
        </View>

        <Text style={styles.meta}>
          A cash-out specialist from our team will text you within 2
          business hours with your locked numbers. No dialer. No robocalls.
          {'\n\n'}
          Generated {new Date(data.generatedAt).toLocaleString('en-US')}
        </Text>
      </Page>
    </Document>
  );
}
