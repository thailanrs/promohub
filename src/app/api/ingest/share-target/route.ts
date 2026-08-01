import { NextRequest, NextResponse } from 'next/server';
import { extractUrlsFromText } from '@/modules/ingestion/services/ingestion.service';

/**
 * PWA Web Share Target API Endpoint.
 * Receives shared native links/text from mobile browsers (Chrome, Safari, Instagram)
 * and redirects the user directly to the Swipe Inbox (/swipe) with feedback.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || '';
    const text = formData.get('text')?.toString() || '';
    const sharedUrl = formData.get('url')?.toString() || '';

    const combinedText = `${title} ${text} ${sharedUrl}`.trim();
    const extractedUrls = extractUrlsFromText(combinedText);

    // Build redirect target URL to Swipe Inbox with ingestion status flag
    const redirectUrl = new URL('/swipe', request.url);
    redirectUrl.searchParams.set('ingested', 'true');
    redirectUrl.searchParams.set('count', extractedUrls.length.toString());

    if (extractedUrls[0]) {
      redirectUrl.searchParams.set('target', extractedUrls[0]);
    }

    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch {
    const redirectUrl = new URL('/swipe?error=ingestion_failed', request.url);
    return NextResponse.redirect(redirectUrl.toString(), 303);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || '';
  const text = searchParams.get('text') || '';
  const sharedUrl = searchParams.get('url') || '';

  const combinedText = `${title} ${text} ${sharedUrl}`.trim();
  const extractedUrls = extractUrlsFromText(combinedText);

  const redirectUrl = new URL('/swipe', request.url);
  redirectUrl.searchParams.set('ingested', 'true');
  redirectUrl.searchParams.set('count', extractedUrls.length.toString());

  return NextResponse.redirect(redirectUrl.toString(), 303);
}
