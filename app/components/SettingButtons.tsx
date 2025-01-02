"use client";

import { toast } from "sonner";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { AiOutlinePicture } from "react-icons/ai";
import { FaXmark } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";
import { useState } from "react";
import { useSession } from "next-auth/react";
import AvatarEditor from "react-avatar-editor";
import { useRef } from "react";

export default function SettingButtons() {
	const [nameEdit, setNameEdit] = useState(false);
	const [imageEdit, setImageEdit] = useState(false);
	const [name, setName] = useState("");
	const [file, setFile] = useState(null);
	const editor = useRef(null);
	const [zoom, setZoom] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [uploading, setUploading] = useState(false);
	const { update } = useSession();

	const saveName = async () => {
		if (name.length < 3) {
			toast.error("Username must be at least 3 characters long.");
			return;
		}
		const res = await fetch("/api/userinfo/set", {
			method: "POST",
			body: JSON.stringify({ name }),
		});
		if (res.ok) {
			toast.success("Username updated.");
			setNameEdit(false);
			await update();
		} else {
			toast.error("Failed to update username.");
		}
	};

	const saveImage = async () => {
		setUploading(true);
		const image = editor.current.getImageScaledToCanvas().toDataURL();
		const res = await fetch("/api/userinfo/image", {
			method: "POST",
			body: JSON.stringify({ image }),
		});
		if (res.ok) {
			toast.success("Profile picture updated.");
			setImageEdit(false);
			setUploading(false);
			await update();
		} else {
			toast.error("Failed to update profile picture.");
			setUploading(false);
		}
	};

	return (
		<main>
			<dialog className="modal" open={nameEdit}>
				<div className="modal-box w-11/12 max-w-md">
					<h3 className="font-bold text-lg">Edit username</h3>
					<input
						type="text"
						placeholder="Type here"
						className="input input-bordered input-primary w-full mt-2"
						onChange={(e) => setName(e.target.value)}
						value={name}
					/>
					<div className="modal-action flex-wrap gap-2">
						<button
							className="btn btn-error text-white"
							onClick={() => setNameEdit(false)}
						>
							<FaXmark className="text-white w-5 h-5" />
							Cancel
						</button>
						<button
							className="btn btn-info text-white"
							onClick={() => saveName()}
						>
							<FaSave className="text-white w-5 h-5" />
							Save
						</button>
					</div>
				</div>
			</dialog>
			<dialog className="modal" open={imageEdit}>
				<div className="modal-box w-11/12 max-w-md">
					<h3 className="font-bold text-lg">
						Upload a new profile picture
					</h3>
					<input
						type="file"
						className="file-input w-full mt-2"
						onChange={(e) =>
							setFile(e.target?.files ? e.target.files[0] : null)
						}
						accept="image/png, image/jpeg, image/jpg"
					/>
					{file && (
						<div className="flex flex-col items-center space-y-3 mt-4">
							<AvatarEditor
								className="rounded-full bg-white max-w-full"
								ref={editor}
								image={file}
								width={200}
								height={200}
								border={0}
								borderRadius={100}
								rotate={rotate}
								scale={zoom}
							/>
							<input
								type="range"
								min="1"
								max="10"
								value={zoom}
								className="range range-primary w-full"
								onChange={(e) =>
									setZoom(Number(e.target.value))
								}
							/>
							<div className="flex flex-col md:flex-row gap-3">
								<button
									className="btn btn-info text-white"
									onClick={() => setRotate(rotate - 90)}
								>
									<FaArrowRotateLeft className="w-5 h-5" />
									Rotate left
								</button>
								<button
									className="btn btn-info text-white"
									onClick={() => setRotate(rotate + 90)}
								>
									Rotate right
									<FaArrowRotateRight className="w-5 h-5" />
								</button>
							</div>
						</div>
					)}
					<div className="modal-action flex-wrap gap-2">
						<button
							className="btn btn-error text-white"
							onClick={() => setImageEdit(false)}
						>
							<FaXmark className="w-5 h-5" />
							Cancel
						</button>
						<button
							className="btn btn-info text-white"
							onClick={() => saveImage()}
							disabled={file === null || uploading}
						>
							{uploading ? (
								<span className="loading loading-spinner loading-sm" />
							) : (
								<FaSave className="w-5 h-5" />
							)}
							Save
						</button>
					</div>
				</div>
			</dialog>
			<div className="flex flex-col md:flex-row gap-3 w-full">
				<button
					className="btn btn-info text-white w-full md:w-auto"
					onClick={() => setNameEdit(true)}
				>
					<MdDriveFileRenameOutline className="w-5 h-5" />
					Edit username
				</button>
				{process.env.NEXT_PUBLIC_ALLOW_AVATAR_UPLOAD && (
					<button
						className="btn btn-info text-white w-full md:w-auto"
						onClick={() => setImageEdit(true)}
					>
						<AiOutlinePicture className="w-5 h-5" />
						Change profile picture
					</button>
				)}
			</div>
		</main>
	);
}
