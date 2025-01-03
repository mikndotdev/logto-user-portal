"use client";

import { signOut } from "next-auth/react";
import { IoMdExit } from "react-icons/io";

export default function ReturnButton() {
	return (
		<div
			className="btn btn-error text-white"
			onClick={() => signOut({ redirectTo: "/return" })}
		>
			<IoMdExit className="text-white w-5 h-5" />
			Return to app
		</div>
	);
}
