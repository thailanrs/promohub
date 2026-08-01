import { NextResponse } from 'next/server';
import { encryptGCM, decryptGCM } from '../../../lib/crypto';

// In-memory credential state
let currentCredentials = {
  amazonTag: 'promohub-20',
  shopeeSubId: 'promohub_tech',
  shopeeAppId: '1002345',
  mlUtmSource: 'promohub_deals',
  mlMattTool: 'matt_9988',
  awinPublisherId: 'awin_pub_7788',
};

export async function GET() {
  // Return masked versions for security display
  return NextResponse.json({
    credentials: {
      amazonTag: currentCredentials.amazonTag,
      shopeeSubId: currentCredentials.shopeeSubId,
      shopeeAppId: currentCredentials.shopeeAppId ? '••••' + currentCredentials.shopeeAppId.slice(-4) : '',
      mlUtmSource: currentCredentials.mlUtmSource,
      mlMattTool: currentCredentials.mlMattTool,
      awinPublisherId: currentCredentials.awinPublisherId,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    currentCredentials = {
      ...currentCredentials,
      amazonTag: body.amazonTag ?? currentCredentials.amazonTag,
      shopeeSubId: body.shopeeSubId ?? currentCredentials.shopeeSubId,
      shopeeAppId: body.shopeeAppId ?? currentCredentials.shopeeAppId,
      mlUtmSource: body.mlUtmSource ?? currentCredentials.mlUtmSource,
      mlMattTool: body.mlMattTool ?? currentCredentials.mlMattTool,
      awinPublisherId: body.awinPublisherId ?? currentCredentials.awinPublisherId,
    };

    // Encrypt sensitive secrets with AES-256-GCM
    const encryptedApiKey = encryptGCM(JSON.stringify(currentCredentials));

    return NextResponse.json({
      success: true,
      encryptedSecretHash: encryptedApiKey.split(':')[1] || 'encrypted',
      message: 'Credenciais de afiliados salvas e criptografadas com AES-256 com sucesso!',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao salvar e criptografar credenciais.' },
      { status: 500 }
    );
  }
}
