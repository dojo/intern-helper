import Task from '../async/Task';
import { Headers, Response as ResponseInterface, RequestOptions } from './interfaces';
import Observable from '../Observable';
export interface ResponseData {
	task: Task<any>;
	used: boolean;
}
declare abstract class Response implements ResponseInterface {
	abstract readonly headers: Headers;
	abstract readonly ok: boolean;
	abstract readonly status: number;
	abstract readonly statusText: string;
	abstract readonly url: string;
	abstract readonly bodyUsed: boolean;
	abstract readonly requestOptions: RequestOptions;
	abstract readonly download: Observable<number>;
	abstract readonly data: Observable<any>;
	json<T>(): Task<T>;
	abstract arrayBuffer(): Task<ArrayBuffer>;
	abstract blob(): Task<Blob>;
	abstract formData(): Task<FormData>;
	abstract text(): Task<string>;
}
export default Response;
export declare function getFileReaderPromise<T>(reader: FileReader): Promise<T>;
export declare function getTextFromBlob(blob: Blob): Promise<string>;
export declare function getArrayBufferFromBlob(blob: Blob): Promise<ArrayBuffer>;
export declare function getTextFromArrayBuffer(buffer: ArrayBuffer): string;
