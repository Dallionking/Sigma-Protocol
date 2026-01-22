# Technical Notes: InvoiceFlow

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **PDF Preview**: @react-pdf/renderer (preview mode)
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (logos)
- **PDF Generation**: @react-pdf/renderer or jsPDF
- **Email**: Resend

### Deployment
- **Hosting**: Vercel
- **Edge Functions**: PDF generation (if needed)

## Key Technical Decisions

### 1. Invoice Number Generation

Sequential, prefixed invoice numbers:

```typescript
async function generateInvoiceNumber(businessId: string): Promise<string> {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('invoice_prefix, next_invoice_number')
    .eq('id', businessId)
    .single();

  const number = business.next_invoice_number.toString().padStart(4, '0');
  const invoiceNumber = `${business.invoice_prefix}-${number}`;

  // Increment for next time
  await supabase
    .from('businesses')
    .update({ next_invoice_number: business.next_invoice_number + 1 })
    .eq('id', businessId);

  return invoiceNumber;
}
```

### 2. Line Item Calculations

Calculate totals client-side, verify server-side:

```typescript
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

function calculateInvoice(
  items: LineItem[],
  taxRate: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): InvoiceCalculations {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    item.total = item.quantity * item.unitPrice;
    return sum + item.total;
  }, 0);

  // Calculate discount
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = subtotal * (discountValue / 100);
  } else {
    discountAmount = discountValue;
  }

  // Calculate tax (after discount)
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);

  // Calculate total
  const total = taxableAmount + taxAmount;

  return {
    subtotal: round(subtotal),
    taxAmount: round(taxAmount),
    discountAmount: round(discountAmount),
    total: round(total),
  };
}

function round(num: number): number {
  return Math.round(num * 100) / 100;
}
```

### 3. PDF Generation with @react-pdf/renderer

Server-side PDF generation:

```typescript
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/pdf/invoice-pdf';

// API Route: /api/invoices/[id]/pdf
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const invoice = await getInvoiceWithDetails(params.id);
  
  const pdfBuffer = await renderToBuffer(
    <InvoicePDF
      invoice={invoice}
      business={invoice.business}
      client={invoice.client}
      items={invoice.items}
    />
  );

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
```

Invoice PDF Component:

```tsx
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  // ... more styles
});

export function InvoicePDF({ invoice, business, client, items }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {business.logo_url && (
            <Image src={business.logo_url} style={styles.logo} />
          )}
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text>#{invoice.invoice_number}</Text>
            <Text>Date: {formatDate(invoice.invoice_date)}</Text>
            <Text>Due: {formatDate(invoice.due_date)}</Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{client.name}</Text>
          <Text>{client.address}</Text>
          <Text>{client.email}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.descCol}>Description</Text>
            <Text style={styles.qtyCol}>Qty</Text>
            <Text style={styles.priceCol}>Price</Text>
            <Text style={styles.totalCol}>Total</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.descCol}>{item.description}</Text>
              <Text style={styles.qtyCol}>{item.quantity}</Text>
              <Text style={styles.priceCol}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.totalCol}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount:</Text>
              <Text>-{formatCurrency(invoice.discount_amount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Tax ({invoice.tax_rate}%):</Text>
            <Text>{formatCurrency(invoice.tax_amount)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {business.bank_details && (
          <View style={styles.bankDetails}>
            <Text style={styles.sectionTitle}>Payment Details:</Text>
            <Text>{business.bank_details}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
```

### 4. Email Integration with Resend

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInvoiceEmail(invoice: Invoice): Promise<void> {
  // Generate PDF
  const pdfResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/invoices/${invoice.id}/pdf`
  );
  const pdfBuffer = await pdfResponse.arrayBuffer();

  await resend.emails.send({
    from: `${invoice.business.name} <invoices@yourdomain.com>`,
    to: invoice.client.email,
    subject: `Invoice ${invoice.invoice_number} from ${invoice.business.name}`,
    html: `
      <p>Hi ${invoice.client.name},</p>
      <p>Please find attached invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total, invoice.business.currency)}.</p>
      <p><strong>Due date:</strong> ${formatDate(invoice.due_date)}</p>
      <p>If you have any questions, please don't hesitate to reach out.</p>
      <p>Best regards,<br/>${invoice.business.name}</p>
    `,
    attachments: [
      {
        filename: `${invoice.invoice_number}.pdf`,
        content: Buffer.from(pdfBuffer),
      },
    ],
  });

  // Update invoice status
  await supabase
    .from('invoices')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', invoice.id);
}
```

### 5. Currency Formatting

```typescript
const currencyFormats: Record<string, Intl.NumberFormatOptions> = {
  USD: { style: 'currency', currency: 'USD' },
  EUR: { style: 'currency', currency: 'EUR' },
  GBP: { style: 'currency', currency: 'GBP' },
  // Add more as needed
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  const options = currencyFormats[currency] || currencyFormats.USD;
  return new Intl.NumberFormat('en-US', options).format(amount);
}
```

### 6. Due Date Calculation

```typescript
import { addDays, format } from 'date-fns';

function calculateDueDate(invoiceDate: Date, paymentTerms: number): Date {
  return addDays(invoiceDate, paymentTerms);
}

function isOverdue(dueDate: Date, status: string): boolean {
  if (status === 'paid') return false;
  return new Date() > dueDate;
}

function daysOverdue(dueDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
```

## API Endpoints

```
# Auth
POST   /api/auth/signup
POST   /api/auth/login

# Business
GET    /api/business              - Get business profile
PATCH  /api/business              - Update business
POST   /api/business/logo         - Upload logo

# Clients
GET    /api/clients               - List clients
POST   /api/clients               - Create client
GET    /api/clients/[id]          - Get client
PATCH  /api/clients/[id]          - Update client
DELETE /api/clients/[id]          - Delete client

# Invoices
GET    /api/invoices              - List invoices
POST   /api/invoices              - Create invoice
GET    /api/invoices/[id]         - Get invoice
PATCH  /api/invoices/[id]         - Update invoice
DELETE /api/invoices/[id]         - Delete invoice
GET    /api/invoices/[id]/pdf     - Download PDF
POST   /api/invoices/[id]/send    - Send email
POST   /api/invoices/[id]/remind  - Send reminder

# Payments
POST   /api/invoices/[id]/payment - Record payment

# Dashboard
GET    /api/dashboard             - Get dashboard stats
```

## Database Indexes

```sql
CREATE INDEX idx_clients_business ON clients(business_id);
CREATE INDEX idx_invoices_business ON invoices(business_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_line_items_invoice ON line_items(invoice_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
```

## Testing Strategy

1. **Unit Tests**: Calculations, currency formatting
2. **Integration Tests**: Invoice CRUD, PDF generation
3. **E2E Tests**: Full create-send-pay flow

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup + Auth | 45 min |
| Business profile | 45 min |
| Client CRUD | 60 min |
| Invoice form + line items | 120 min |
| Calculations logic | 30 min |
| PDF generation | 90 min |
| Email sending | 45 min |
| Payment tracking | 45 min |
| Dashboard | 60 min |
| Polish + testing | 60 min |
| **Total** | **~10-12 hours** |


