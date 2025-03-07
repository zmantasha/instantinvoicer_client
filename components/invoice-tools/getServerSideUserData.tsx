import { cookies } from 'next/headers';

export async function getServerSideUserData() {
  const accessToken = cookies().get('accessToken')?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}