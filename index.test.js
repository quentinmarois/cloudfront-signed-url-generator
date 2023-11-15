const { doesFileExist } = require('./index');
const { S3Client } = require("@aws-sdk/client-s3");

jest.mock("@aws-sdk/client-s3");

afterEach(() => {
  jest.clearAllMocks();
});

describe('doesFileExist', () => {
  test('should return true for existing file', async () => {
    S3Client.prototype.send.mockResolvedValue({});
    const result = await doesFileExist('test.txt');
    expect(result).toBe(true);
  });

  test('should return false for non-existing file', async () => {
    S3Client.prototype.send.mockRejectedValue({ name: 'NoSuchKey' });
    const result = await doesFileExist('does-not-exist.txt');
    expect(result).toBe(false);
  });

  test('should return false for existing folder', async () => {
    S3Client.prototype.send.mockResolvedValue({ name: 'NoSuchKey' });
    const result = await doesFileExist('folder/');
    expect(result).toBe(false);
  });

  test('should return false for non-existing folder', async () => {
    S3Client.prototype.send.mockRejectedValue({ name: 'NoSuchKey' });
    const result = await doesFileExist('does-not-exist/');
    expect(result).toBe(false);
  });
});