export class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Line {
  public start: Point = new Point(0, 0);
  public end: Point = new Point(0, 0);

  public drawLine(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin
  ): void {
    this.configPenContext(
      context,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin
    );
    context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
    context.stroke();
    context.closePath();
  }

  public drawRectangle(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin,
    isFilled: boolean
  ): void {
    this.configPenContext(
      context,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin,
      isFilled
    );
    if (isFilled) {
      context.fillRect(this.start.x, this.start.y, this.width, this.height);
    }
    else {
      context.strokeRect(this.start.x, this.start.y, this.width, this.height);
    }
  }

  public drawCircle(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin,
    isFilled: boolean
  ): void {
    this.configPenContext(
      context,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin,
      isFilled
    );
    context.beginPath();
    context.arc(this.start.x, this.start.y, this.distance, 0, Math.PI * 2, true);
    if (isFilled) {
      context.fill();
    }
    else {
      context.stroke();
    }
    context.closePath();
  }

  public drawBalancedTriangle(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin,
    isFilled: boolean
  ): void {
    const points: Point[] = [
      new Point(
        this.start.x + (this.width / 2),
        this.start.y
      ),
      new Point(
        this.start.x,
        this.end.y
      ),
      new Point(
        this.end.x,
        this.end.y
      )
    ]
    this.drawShape(
      context,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin,
      isFilled,
      points
    );
  }

  public drawDiamond(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin,
    isFilled: boolean
  ): void {
    const points: Point[] = [
      new Point(
        this.start.x + (this.width / 2),
        this.start.y
      ),
      new Point(
        this.start.x,
        this.start.y + (this.height / 2),
      ),
      new Point(
        this.start.x + (this.width / 2),
        this.end.y
      ),
      new Point(
        this.end.x,
        this.start.y + (this.height / 2)
      )
    ]
    this.drawShape(
      context,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin,
      isFilled,
      points
    );
  }

  public drawShape(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin,
    isFilled: boolean,
    points: Point[]
  ): void {
    this.configPenContext(
      context,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin,
      isFilled
    );
    context.beginPath();
    this.getShapeLines(
      points
    ).forEach(
      (line, index, arr) => {
        if (index === 0) {
          context.moveTo(line.start.x, line.start.y);
        }
        context.lineTo(line.end.x, line.end.y);
        if (index === arr.length - 1) {
          if (isFilled) {
            context.fill();
          }
          else {
            context.stroke();
          }
        }
      }
    );
    context.closePath();
  }

  public drawImage(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource
  ): void {
    context.drawImage(image, this.start.x, this.start.y, this.width, this.height);
  }

  private configPenContext(
    context: CanvasRenderingContext2D,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap: CanvasLineCap,
    lineJoin: CanvasLineJoin,
    isFilled?: boolean
  ): void {
    if (isFilled) {
      context.fillStyle = strokeStyle
    }
    else {
      context.strokeStyle = strokeStyle;
    }
    context.lineWidth = lineWidth;
    context.lineCap = lineCap;
    context.lineJoin = lineJoin;
  }

  private getShapeLines(
    points: Point[]
  ): Line[] {
    const lines: Line[] = [];
    for(var i = 0; i < points.length; i++) {
      const j = (i === points.length - 1) ? 0 : i + 1;
      const line = new Line();
      line.start = points[i];
      line.end = points[j];
      lines.push(line);
    }
    return lines;
  }

  private get distance(): number {
    return Math.sqrt(
      Math.pow(this.width, 2) + Math.pow(this.height, 2)
    );
  }

  private get width(): number {
    return this.end.x - this.start.x;
  }

  private get height(): number {
    return this.end.y - this.start.y;
  }
}

export class TextPoint extends Point {
  public text: string = '';

  public drawText(
    context: CanvasRenderingContext2D,
    font: string,
    color: string | CanvasGradient | CanvasPattern,
    isFilled: boolean,
  ): void {
    context.font = font;
    if (isFilled) {
      context.fillStyle = color;
      context.fillText(this.text, this.x, this.y);
    }
    else {
      context.strokeStyle = color;
      context.strokeText(this.text, this.x, this.y);
    }
  }
}

export interface Shape {
  structure: Line | Line[] | TextPoint;
  color?: string;
  width: number;
  type: DrawType;
  filled?: boolean;
  imageUrl?: string;
  font?: string
}

export interface Sketch {
  id?: number;
  name: string;
  imageURL?: string;
  background: string;
  width: number;
  height: number
}

export enum DrawType {
  Sketch,
  Eraser,
  Line,
  Rectangle,
  Circle,
  Triangle,
  Diamond,
  Text,
  Image
}
