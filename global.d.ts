declare module '*.css'

declare module 'heic-convert' {
	interface ConvertInput {
		buffer: Buffer
		format: 'JPEG' | 'PNG'
		quality?: number
	}

	type ConvertOutput = Buffer | Uint8Array | ArrayBuffer

	export default function heicConvert(input: ConvertInput): Promise<ConvertOutput>
}
