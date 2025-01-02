import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
	const cookieStore = await cookies();
	const url = new URL(request.url);
	const callback = url.searchParams.get("url");

	if (callback) {
		cookieStore.set("callback", callback);
		return NextResponse.redirect(process.env.APP_URL as string);
	}

	return NextResponse.redirect(process.env.APP_URL as string);
}
