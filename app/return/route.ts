import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signOut, auth } from "@/auth";

export const runtime = "edge";

export async function GET() {
	const session = await auth();
	const cookieStore = await cookies();
	const callback = cookieStore.get("callback");

	if (session) {
		if (callback) {
			await signOut({ redirectTo: "/return" });
		} else {
			return NextResponse.redirect(process.env.APP_URL as string);
		}
	} else {
		if (callback) {
			cookieStore.delete("callback");
			return NextResponse.redirect(callback.value);
		} else {
			return NextResponse.redirect(process.env.APP_URL as string);
		}
	}
}
