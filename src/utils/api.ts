export async function checkIdExists(idNumber: string): Promise<boolean> {
  const res = await fetch('/api/check-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idNumber }),
  });

  const data = await res.json();
  return data.exists;
}
