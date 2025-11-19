import { CustomeRegistry } from '../producer/event/registry';
import * as zlib from 'zlib';
import { promisify } from 'util';
import * as avro from 'avsc';

// ---- MOCKS ----

// mock deflate (callback API)
const mockDeflate = jest.fn((buf, cb) => {
    cb(null, Buffer.from('mock-compress-buffer'));
});

// mock zlib module
jest.mock('zlib', () => ({
    deflate: jest.fn((buf, callback) => callback(null, Buffer.from('mock-compress-buffer')))
}));

// mock avsc module
jest.mock('avsc', () => ({
    Type: {
        forSchema: jest.fn(() => ({
            toBuffer: jest.fn(() => Buffer.from('mock-avro-buffer'))
        }))
    }
}));

describe('CustomeRegistry', () => {
    let customeRegistry: CustomeRegistry;
    let mockSchemaDef: string;

    beforeEach(() => {
        // mock Avro schema JSON
        mockSchemaDef = JSON.stringify({
            name: 'SampleSchema',
            type: 'record',
            fields: [{ name: 'id', type: 'string' }]
        });

        customeRegistry = new CustomeRegistry(mockSchemaDef);
        jest.clearAllMocks();
    });

    it('should encode data with NO compression', async () => {
        const schemaId = 'de005f74-5163-4358-8cbb-0de4c21528bc';
        const data = { id: '123' };

        const result = await customeRegistry.encode(schemaId, data, { compress: false });

        // Avro schema should be used
        expect(avro.Type.forSchema).toHaveBeenCalledWith(JSON.parse(mockSchemaDef));

        // Should return a Buffer
        expect(result).toBeInstanceOf(Buffer);

        // Should contain mocked avro buffer
        expect(result.toString()).toContain('mock-avro-buffer');

        // Should NOT call deflate
        expect(zlib.deflate).not.toHaveBeenCalled();
    });

    it('should encode data WITH compression', async () => {
        const schemaId = 'de005f74-5163-4358-8cbb-0de4c21528bc';
        const data = { id: '123' };

        const result = await customeRegistry.encode(schemaId, data, { compress: true });

        // deflate should be called
        expect(zlib.deflate).toHaveBeenCalled();

        // Should return a Buffer
        expect(result).toBeInstanceOf(Buffer);

        // Should contain mocked compression output
        expect(result.toString()).toContain('mock-compress-buffer');
    });
});