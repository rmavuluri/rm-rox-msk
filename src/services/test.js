import { v4 as uuid, parse as uuidParse } from "uuid";
import { promises as zlib } from "zlib";
import * as avro from "avsc";

export interface EncodeProps {
    compress: boolean;
}

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

    // Pre-Built Header Buffers
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
        const idBytes = uuidParse(id);
        return new Uint8Array(idBytes);
    }

    async encode(glueSchemaId: string, object: any, props?: EncodeProps): Promise<Buffer> {
        //
        // Step 1: Build Avro Schema
        //
        const schema = avro.Type.forSchema(
            JSON.parse(this.schemaDefinition)
        );

        const buf = schema.toBuffer(object);

        //
        // Step 2: Choose compression function
        //
        const ZLIB_COMPRESS_FUNC = async (b: Buffer): Promise<Buffer> => {
            return zlib.deflate(b);
        };

        const NO_COMPRESS_FUNC = async (b: Buffer): Promise<Buffer> => b;

        let compressionFunc = ZLIB_COMPRESS_FUNC;
        let compressionByte = CustomeRegistry.COMPRESSION_ZLIB_BYTE;

        if (props && !props.compress) {
            compressionFunc = NO_COMPRESS_FUNC;
            compressionByte = CustomeRegistry.COMPRESSION_DEFAULT_BYTE;
        }

        //
        // Step 3: Build message
        //
        const compressedBuf = await compressionFunc(buf);

        const schemaIdBuf = this.UUIDStringToByteArray(glueSchemaId);

        const output = Buffer.concat([
            CustomeRegistry.HEADER_VERSION_BYTE,
            compressionByte,
            Buffer.from(schemaIdBuf),
            compressedBuf
        ]);

        return output;
    }
}