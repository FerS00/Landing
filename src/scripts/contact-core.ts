export interface ContactData {
  name: string;
  email: string;
  type: string;
  message: string;
  lang?: string;
}

export interface ContactErrors {
  name?: 'required' | 'length';
  email?: 'required' | 'email' | 'length';
  type?: 'invalid';
  message?: 'required' | 'length';
  lang?: 'invalid';
}

export function validateContact(data: ContactData): ContactErrors {
  const errors: ContactErrors = {};
  const name = data.name.trim();
  const email = data.email.trim();
  const message = data.message.trim();
  if (!name) errors.name = 'required';
  else if (name.length > 100) errors.name = 'length';
  if (!email) errors.email = 'required';
  else if (email.length > 254) errors.email = 'length';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'email';
  if (!['freelance', 'collaboration'].includes(data.type)) errors.type = 'invalid';
  if (!message) errors.message = 'required';
  else if (message.length < 10 || message.length > 5000) errors.message = 'length';
  if (data.lang !== undefined && data.lang !== 'es' && data.lang !== 'en') errors.lang = 'invalid';
  return errors;
}
