export interface SketchUpdateNameRequest {
  id: number;
  name: string;
}

export interface SketchUpdateImageRequest {
  id: number;
  imageURL: string;
}

export interface SketchUpdateBackgroundRequest {
  id: number;
  background: string;
}

export interface SketchUpdateSizeRequest {
  id: number;
  width: number;
  height: number;
}
