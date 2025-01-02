export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth, signIn } from "@/auth";

export async function GET() {
	const session = await auth();

	if (session) {
		return NextResponse.redirect(`${process.env.APP_URL}/dashboard`);
	}

	if (!session) {
		await signIn("logto", {
			redirectTo: `${process.env.APP_URL}/dashboard`,
		});
	}
}
