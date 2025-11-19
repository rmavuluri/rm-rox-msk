import { v4 as uuid, parse as uuidParse } from "uuid";
import * as zlib from "zlib";
import { promisify } from "util";
import * as avro from "avsc";

export interface EncodeProps {
    compress: boolean;
}

// Convert callback API → Promise API
const deflateAsync = promisify(zlib.deflate);

export class CustomeRegistry {
    public schemaDefinition: any;

    constructor(schemaDefinition: any) {
        this.schemaDefinition = schemaDefinition;
    }

    // Compression Flags
    static COMPRESSION_DEFAULT = 0;
    static COMPRESSION_ZLIB = 5;

    // Message Header Version
    static HEADER_VERSION = 3;

    // Prebuilt header byte buffers
    private static HEADER_VERSION_BYTE = CustomeRegistry.initByteBuffer(
        CustomeRegistry.HEADER_VERSION
    );

    private static COMPRESSION_DEFAULT_BYTE = CustomeRegistry.initByteBuffer(
        CustomeRegistry.COMPRESSION_DEFAULT
    );

    private static COMPRESSION_ZLIB_BYTE = CustomeRegistry.initByteBuffer(
        CustomeRegistry.COMPRESSION_ZLIB
    );

    private static initByteBuffer(value: number): Buffer {
        return Buffer.from([value]);
    }

    private UUIDStringToByteArray(id: string): Uint8Array {
        return new Uint8Array(uuidParse(id));
    }

    async encode(glueSchemaId: string, object: any, props?: EncodeProps): Promise<Buffer> {
        //
        // Step 1: Build Avro schema & serialize data
        //
        const schema = avro.Type.forSchema(JSON.parse(this.schemaDefinition));
        const buf = schema.toBuffer(object);

        //
        // Step 2: Select compression
        //
        const ZLIB_COMPRESS_FUNC = async (b: Buffer): Promise<Buffer> => {
            return deflateAsync(b); // native promises
        };

        const NO_COMPRESS_FUNC = async (b: Buffer): Promise<Buffer> => b;

        let compressionFunc = ZLIB_COMPRESS_FUNC;
        let compressionByte = CustomeRegistry.COMPRESSION_ZLIB_BYTE;

        if (props && !props.compress) {
            compressionFunc = NO_COMPRESS_FUNC;
            compressionByte = CustomeRegistry.COMPRESSION_DEFAULT_BYTE;
        }

        //
        // Step 3: Apply compression
        //
        const compressedBuf = await compressionFunc(buf);

        //
        // Step 4: Add schema ID (UUID → 16 bytes)
        //
        const schemaIdBytes = this.UUIDStringToByteArray(glueSchemaId);

        //
        // Step 5: Build final payload
        //
        const output = Buffer.concat([
            CustomeRegistry.HEADER_VERSION_BYTE, // 1 byte
            compressionByte,                     // 1 byte
            Buffer.from(schemaIdBytes),          // 16 bytes UUID
            compressedBuf                        // remaining compressed Avro
        ]);

        return output;
    }
}