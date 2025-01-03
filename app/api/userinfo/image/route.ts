import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "edge";

const s3Client = new S3Client({
	region: process.env.S3_REGION,
	endpoint: process.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY ?? "",
		secretAccessKey: process.env.S3_SECRET_KEY ?? "",
	},
});

export async function POST(request: NextRequest) {
	const session = await auth();
	const body = await request.json();
	const { image } = body;

	if (process.env.NEXT_PUBLIC_ALLOW_AVATAR_UPLOAD !== "true") {
		return new Response("Avatar uploads are disabled", { status: 503 });
	}

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!image) {
		return new Response("Missing parameters", { status: 400 });
	}

	const imagePayload = Buffer.from(image.split(",")[1], "base64");
	const contentType = image.split(";")[0].split(":")[1];
	const filename = `${process.env.UPLOAD_DIR}/${session?.user?.id}-${Date.now()}.${contentType.split("/")[1]}`;

	const putObjectCommand = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: filename,
		Body: imagePayload,
		ContentType: contentType,
	});

	try {
		await s3Client.send(putObjectCommand);
	} catch (error) {
		console.error("Error uploading to S3:", error);
		return new Response("Error uploading to S3", { status: 500 });
	}

	const FQURL = `${process.env.S3_BASE_URL}/${filename}`;

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
				avatar: FQURL,
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
