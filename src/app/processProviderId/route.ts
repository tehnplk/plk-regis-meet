import { NextRequest } from 'next/server';
import { providerIdProcess } from '../actions/sign-in';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const landing = searchParams.get('landing') ?? '/profile';
  const isAuth = searchParams.get('is_auth') ?? 'yes';

  const formData = new FormData();
  formData.set('landing', landing);
  formData.set('is_auth', isAuth);

  return providerIdProcess(formData);
}
