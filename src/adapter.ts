import type { Adapter, AdapterUser } from 'next-auth/adapters';
import {
  getUserByIdQuery,
  getUserByProviderAccountIdQuery,
  getUserByEmailQuery,
  getVerificationTokenQuery
} from './queries';
import type { SanityClient } from '@sanity/client';
import { uuid } from '@sanity/uuid';
import { Account } from 'next-auth';

export function SanityAdapter(
  client: SanityClient,
  options = {
    schemas: {
      account: 'account',
      verificationToken: 'verification-token',
      user: 'user'
    }
  }
): Adapter {
  return {
    async createUser(profile) {
      const user = await client.create({
        _id: `user.${uuid()}`,
        _type: options.schemas.user,
        email: profile.email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        username: profile.name,
        avatar: profile.image
      });

      return {
        id: user._id,
        emailVerified: null,
        email: user.email,
        username: user.username,
        lastname: user.lastname,
        firstname: user.firstname,
        avatar: user.avatar,
        // role: user.role,
      } as AdapterUser;
    },

    async getUser(id) {
      const user = await client.fetch(getUserByIdQuery, {
        userSchema: options.schemas.user,
        id
      });

      if (!user) return null;

      return {
        id: user._id,
        ...user
      };
    },

    async linkAccount({
      provider,
      providerAccountId,
      refresh_token,
      access_token,
      expires_at,
      userId,
      type
    }) {
      await client.create({
        _type: options.schemas.account,
        providerId: provider,
        providerType: type,
        providerAccountId: `${providerAccountId}`,
        refreshToken: refresh_token,
        accessToken: access_token,
        accessTokenExpires: expires_at,
        user: {
          _type: 'reference',
          _ref: userId
        }
      })

      return {
        providerAccountId: `${providerAccountId}`,
        userId,
        provider
      } as Account
    },

    async createSession() {
      return {} as any;
    },

    async updateSession() {
      return {} as any;
    },

    async deleteSession() {},

    async updateUser(user) {
      const { id, username, fisrtname, lastname, email, avatar } = user;

      const newUser = await client
        .patch(id!)
        .set({
          username,
          fisrtname, 
          lastname,
          email,
          avatar
        })
        .commit();

      return {
        id: newUser._id,
        ...newUser,
        emailVerified: null
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const user = await client.fetch(getUserByEmailQuery, {
        userSchema: options.schemas.user,
        email
      });

      if (!user) return null;

      return {
        id: user._id,
        ...user
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await client.fetch(getUserByProviderAccountIdQuery, {
        accountSchema: options.schemas.account,
        providerId: provider,
        providerAccountId
      });

      if (!account) return null;

      return {
        id: account.user._id,
        emailVerified: null,
        providerId: account?.providerId,
        providerAccountId: account?.providerAccountId,
        ...account.user
      };
    },
    async getSessionAndUser() {
      return {} as any;
    },

    async createVerificationToken({ identifier, token, expires }) {
      const verificationToken = await client.create({
        _type: options.schemas.verificationToken,
        identifier,
        token,
        expires
      });

      return verificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await client.fetch(getVerificationTokenQuery, {
        verificationTokenSchema: options.schemas.verificationToken,
        identifier,
        token
      });

      if (!verificationToken) return null;

      await client.delete(verificationToken._id);

      return {
        id: verificationToken._id,
        ...verificationToken
      };
    }
  };
}
