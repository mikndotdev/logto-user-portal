import { auth } from "@/auth";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
	const session = await auth();
	const body = await request.json();
	const { name } = body;

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!name) {
		return new Response("Missing parameters", { status: 400 });
	}

	const authID = process.env.LOGTO_M2M_ID;
	const authSecret = process.env.LOGTO_M2M_SECRET;

	const BasicAuth = Buffer.from(`${authID}:${authSecret}`).toString("base64");

	const LogtoResponse = await fetch(`${process.env.LOGTO_URL}/oidc/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${BasicAuth}`,
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "all",
			resource: "https://default.logto.app/api",
		}),
	});

	if (!LogtoResponse.ok) {
		throw new Error(
			`Failed to get Logto token: ${LogtoResponse.statusText}`,
		);
	}

	const data = await LogtoResponse.json();
	const token = data.access_token;

	const LogtoInfoResponse = await fetch(
		`${process.env.LOGTO_URL}/api/users/${session?.user?.id}`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				name: name,
			}),
		},
	);

	if (LogtoInfoResponse.ok) {
		return new Response("Info updated", { status: 200 });
	} else {
		const errorText = await LogtoInfoResponse.text();
		console.error("Error updating Logto info:", errorText);
		return new Response("Error updating Logto info", { status: 500 });
	}
}
