"use client";

import { useSession } from "next-auth/react";

export default function UserCard() {
	const { status, data: session } = useSession();

	if (status === "loading") {
		return (
			<div className="card bg-gray-700 flex mt-5 w-1/2 p-11 flex flex-row justify-center">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	return (
		<div className="card bg-gray-700 flex mt-5 w-1/2 p-6">
			<div className="flex flex-row">
				<img
					className={"rounded-full w-20 h-20"}
					src={session?.user?.image as string}
					alt={"Avatar"}
				/>
				<div className={"flex flex-col ml-5 justify-center"}>
					<div
						className={
							"flex flex-row justify-center items-center space-x-2"
						}
					>
						<p className="text-white text-3xl font-bold">
							{session?.user?.name}
						</p>
						<p>UID {session?.user?.id}</p>
					</div>
					<p className="text-white text-lg">{session?.user?.email}</p>
				</div>
			</div>
		</div>
	);
}
