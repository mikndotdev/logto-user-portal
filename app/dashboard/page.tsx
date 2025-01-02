export const runtime = "edge";

import { auth, signIn } from "@/auth";
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
		<main className="flex flex-col justify-center items-center">
			<div className="flex justify-center items-center mt-5">
				<h1 className="text-white font-bold text-4xl">
					Account Portal
				</h1>
			</div>
			<div className="card bg-gray-600 flex mt-5 w-11/12 p-6 items-center justify-center">
				<UserCard />
				<div className={"flex flex-row space-x-2"}>
					<SettingsButtons />
					{callback && <ReturnButton />}
				</div>
			</div>
		</main>
	);
}
