import { company } from '../data/company';

/** Builds a WhatsApp link with the visitor's first message already written. */
export function whatsappLink(message = "Hi CHS Tours, I'd like help planning a trip."): string {
  const number = company.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function telLink(): string {
  return `tel:${company.phone.replace(/\s/g, '')}`;
}

/** Just the amount, e.g. "₹75,000", or null when the price is on request. */
export function formatAmount(price: number | null): string | null {
  return price ? `₹${price.toLocaleString('en-IN')}` : null;
}

export function formatPrice(price: number | null): string {
  return price ? `From ₹${price.toLocaleString('en-IN')} per person` : 'Price on request';
}
