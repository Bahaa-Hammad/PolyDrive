import { StorageAdapter } from '../interfaces/storage-adapter.interface';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export class S3StorageAdapter implements StorageAdapter {
  constructor(
    private endpoint: string,
    private accessKey: string,
    private secretKey: string,
    private bucket: string,
    private region: string = 'us-east-1',
  ) {}

  async store(id: string, data: Buffer): Promise<string> {
    const method = 'PUT';
    const path = `/${this.bucket}/${this.sanitizeKey(id)}`;
    
    const headers = this.createHeaders(method, path, data);
    
    const response = await this.makeRequest(method, path, headers, data);
    if (response.statusCode !== 200 && response.statusCode !== 201) {
      throw new Error(`Failed to store blob: ${response.statusCode} ${response.body}`);
    }
    
    return `${this.bucket}/${id}`;
  }

  async retrieve(id: string): Promise<Buffer> {
    const method = 'GET';
    const path = `/${this.bucket}/${this.sanitizeKey(id)}`;
    
    const headers = this.createHeaders(method, path);
    
    const response = await this.makeRequest(method, path, headers);
    if (response.statusCode === 404) {
      throw new Error(`Blob with id ${id} not found`);
    }
    if (response.statusCode !== 200) {
      throw new Error(`Failed to retrieve blob: ${response.statusCode} ${response.body}`);
    }
    
    return Buffer.from(response.body);
  }

  async delete(id: string): Promise<void> {
    const method = 'DELETE';
    const path = `/${this.bucket}/${this.sanitizeKey(id)}`;
    
    const headers = this.createHeaders(method, path);
    
    const response = await this.makeRequest(method, path, headers);
    if (response.statusCode !== 204 && response.statusCode !== 200 && response.statusCode !== 404) {
      throw new Error(`Failed to delete blob: ${response.statusCode} ${response.body}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const method = 'HEAD';
    const path = `/${this.bucket}/${this.sanitizeKey(id)}`;
    
    const headers = this.createHeaders(method, path);
    
    const response = await this.makeRequest(method, path, headers);
    return response.statusCode === 200;
  }

  private createHeaders(method: string, path: string, payload?: Buffer): Record<string, string> {
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substring(0, 8);
    const payloadHash = this.hash(payload || '');
    
    const headers: Record<string, string> = {
      'Host': this.getHost(),
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': timestamp,
    };

    if (payload) {
      headers['Content-Length'] = payload.length.toString();
    }

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    const canonicalRequest = [
      method,
      path,
      '', // query string
      canonicalHeaders + '\n',
      signedHeaders,
      payloadHash
    ].join('\n');

    // Create string to sign
    const scope = `${date}/${this.region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      scope,
      this.hash(canonicalRequest)
    ].join('\n');

    // Calculate signature
    const signingKey = this.getSigningKey(date, this.region, 's3');
    const signature = this.hmac(signingKey, stringToSign).toString('hex');

    // Add authorization header
    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return headers;
  }

  private getSigningKey(date: string, region: string, service: string): Buffer {
    const kDate = this.hmac(`AWS4${this.secretKey}`, date);
    const kRegion = this.hmac(kDate, region);
    const kService = this.hmac(kRegion, service);
    return this.hmac(kService, 'aws4_request');
  }

  private hmac(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }

  private hash(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private getHost(): string {
    const url = new URL(this.endpoint);
    return url.host;
  }

  private sanitizeKey(id: string): string {
    // URL encode the key to handle special characters
    return encodeURIComponent(id);
  }

  private makeRequest(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: Buffer
  ): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.endpoint);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: path,
        method: method,
        headers: headers,
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            body: data,
          });
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }
} 