import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

export const getFileDataURL = (file: File): Observable<string> => {
  return readFileData(file).pipe(
    map((data) => {
      const url = `data:${file.type};base64, ` + _arrayBufferToBase64(data);
      return url;
    })
  );
}

const readFileData = (file: File): Observable<ArrayBuffer> => {
  return from(file.arrayBuffer());
}

const _arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  var binary = '';
  const bytes = new Uint8Array(buffer);
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
