import * as jose from "jose";

export const verify = async (
	signingKey: string,
	rawBody: Buffer[],
	expectedSignature: string,
) => {
	const keyBytes = new TextEncoder().encode(signingKey);
	const key = await jose.importJWK({ kty: "oct", k: Buffer.from(keyBytes).toString("base64") }, "HS256");

	try {
		const rawBodyUint8Array = new Uint8Array(Buffer.concat(rawBody));
		const signature = await new jose.CompactSign(rawBodyUint8Array)
			.setProtectedHeader({ alg: "HS256" })
			.sign(key);

		const signaturePart = signature.split(".")[2];

		const signatureHex = Buffer.from(signaturePart, "base64url").toString(
			"hex",
		);

		return signatureHex === expectedSignature;
	} catch (error) {
		throw new Error("Signature verification failed: " + (error as Error).message);
	}
};