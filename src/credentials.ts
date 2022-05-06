import { CredentialsProvider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { SanityClient } from '@sanity/client';
import { getUserByEmailQuery, getUserByEmailOrUsernameQuery, getUserByEmailOrUsername } from './queries';
import argon2 from 'argon2';
import { uuid } from '@sanity/uuid';

type CredentialsConfig = ReturnType<CredentialsProvider>;

export const signUpHandler =
  (client: SanityClient, userSchema: string = 'user') =>
  async (req: any, res: any) => {
    const { email, password, firstname, lastname, username, image } = req.body;
    console.log(req.body, 'body')
    const user = await client.fetch(getUserByEmailOrUsername, {
      userSchema,
      email,
      username
    });

    if (user) {
      res.json({ error: 'User already exist' });
      return;
    }

    const newUser = await client.create({
      _id: `user.${uuid()}`,
      _type: userSchema,
      email,
      password: await argon2.hash(password),
      firstname,
      lastname,
      username,
      image
    });

    res.json({
      email: newUser.email,
      username: newUser.username,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      image: newUser.image
    });
  };

export const SanityCredentials = (
  client: SanityClient,
  userSchema = 'user'
): CredentialsConfig[] =>
  [
    Credentials({
      name: 'Credentials',
      id: 'sanity-login-email',
      type: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        const user = await client.fetch(getUserByEmailQuery, {
          userSchema,
          email: credentials?.email
        });
  
        console.log(user, 'user')
        if (!user) throw new Error('Email does not exist');
        
        console.log(user.password, 'user.password')
        console.log(credentials?.password!, 'credentials?.password!')

        if (await argon2.verify(user.password, credentials?.password!)) {
          return {
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            id: user._id
          };
        }
  
        throw new Error('Password Invalid');
      }
    }),
    Credentials({
      name: 'Credentials',
      id: 'sanity-login-username-or-email',
      type: 'credentials',
      credentials: {
        label: {
          label: 'Username or Email',
          type: 'text'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        const user = await client.fetch(getUserByEmailOrUsernameQuery, {
          userSchema,
          label: credentials?.label
        });
  
        if (!user) throw new Error('Email does not exist');
  
        if (await argon2.verify(user.password, credentials?.password!)) {
          return {
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            id: user._id
          };
        }
  
        throw new Error('Password Invalid');
      }
    })
  ]
