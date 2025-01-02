"use client";

import { useSession } from "next-auth/react";

export default function UserCard() {
	const { status, data: session } = useSession();

	if (status === "loading") {
		return (
			<div className="card bg-gray-700 w-full p-6 flex justify-center">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	return (
		<div className="card bg-gray-700 w-full p-4 md:p-6">
			<div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
				<img
					className="rounded-full w-20 h-20"
					src={session?.user?.image as string}
					alt="Avatar"
				/>
				<div className="flex flex-col justify-center">
					<div className="flex flex-col md:flex-row items-center gap-2">
						<p className="text-white text-2xl md:text-3xl font-bold">
							{session?.user?.name}
						</p>
						<p className="text-sm">UID {session?.user?.id}</p>
					</div>
					<p className="text-white text-base md:text-lg mt-1">
						{session?.user?.email}
					</p>
				</div>
			</div>
		</div>
	);
}
