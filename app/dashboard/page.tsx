export const runtime = "edge";

import { auth } from "@/auth";
import { cookies } from "next/headers";
import ReturnButton from "@/app/components/returnButton";
import SettingsButtons from "@/app/components/SettingButtons";
import UserCard from "@/app/components/UserCard";
import { redirect } from "next/navigation";

export default async function Dashboard() {
	const session = await auth();
	const cookieStore = await cookies();
	const callback = await cookieStore.get("callback");

	if (!session) {
		await redirect("/");
	}

	return (
		<main className="flex min-h-screen flex-col items-center p-4">
			<div className="w-full max-w-4xl">
				<h1 className="text-white font-bold text-3xl md:text-4xl text-center my-5">
					Account Portal
				</h1>
				<div className="card bg-gray-600 w-full p-4 md:p-6">
					<UserCard />
					<div className="flex flex-col md:flex-row items-center gap-3 mt-4">
						<SettingsButtons />
						{callback && <ReturnButton />}
					</div>
				</div>
			</div>
		</main>
	);
}
