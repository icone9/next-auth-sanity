import { User } from 'next-auth';
import axios from 'axios';

export interface SignUpData {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  username?: string;
}

export const signUp = async (data: SignUpData) => {
  const res = await axios.post<User>('/api/sanity/signUp', {
    ...data
  });

  return res.data;
};
