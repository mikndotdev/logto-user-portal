import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT) {
	try {
		const response = await fetch(`${process.env.LOGTO_URL}/oidc/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: process.env.LOGTO_CLIENT_ID || "",
				client_secret: process.env.LOGTO_CLIENT_SECRET || "",
				grant_type: "refresh_token",
				refresh_token: token.refreshToken as string,
			}),
		});

		const refreshedTokens = await response.json();

		if (!response.ok) {
			throw refreshedTokens;
		}

		return {
			...token,
			accessToken: refreshedTokens.access_token,
			accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
			refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
		};
	} catch (error) {
		console.log(error);
		return {
			...token,
			error: "RefreshAccessTokenError",
		};
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, account, user }) {
			if (account && user) {
				return {
					accessToken: account.access_token,
					accessTokenExpires: account.expires_at
						? account.expires_at * 1000
						: undefined,
					refreshToken: account.refresh_token,
					user,
				};
			}

			if (Date.now() < (token.accessTokenExpires as number)) {
				return token;
			}

			return refreshAccessToken(token);
		},
		async session({ session, token }) {
			if (token.error) {
				return { ...session, error: token.error };
			}

			try {
				const response = await fetch(
					`${process.env.LOGTO_URL}/oidc/me`,
					{
						headers: {
							Authorization: `Bearer ${token.accessToken}`,
						},
					},
				);

				if (response.ok) {
					const userInfo = await response.json();
					session.user = {
						id: userInfo.sub,
						name: userInfo.name ?? userInfo.username,
						email: userInfo.email,
						image: userInfo.picture,
						emailVerified: userInfo.email_verified,
					};
				} else {
					console.error(
						"Failed to fetch user info:",
						response.statusText,
					);
				}
			} catch (error) {
				console.error("Error fetching user info:", error);
			}

			(session as any).accessToken = token.accessToken;
			return session;
		},
	},
	providers: [
		{
			id: "logto",
			name: "Logto",
			type: "oidc",
			issuer: `${process.env.LOGTO_URL}/oidc`,
			authorization: {
				params: {
					scope: "openid offline_access profile email identities",
				},
			},

			clientId: process.env.LOGTO_CLIENT_ID,
			clientSecret: process.env.LOGTO_CLIENT_SECRET,
			token: true,
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name ?? profile.username,
					email: profile.email,
					image: profile.picture,
				};
			},
		},
	],
});
